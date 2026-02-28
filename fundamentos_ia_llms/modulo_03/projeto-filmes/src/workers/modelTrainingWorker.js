import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';
let _globalCtx = {};
let _model = null

const WEIGHTS = {
    category: 0.25,
    genre: 0.2,
    director: 0.1,
    duration: 0.1,
    year: 0.1,
    rating: 0.15,
    age: 0.1,
};


// 🔢 Normalize continuous values (duration, year, rating, age) to 0–1 range
// Why? Keeps all features balanced so no one dominates training
// Formula: (val - min) / (max - min)
// Example: duration=181, minDuration=100, maxDuration=181 → 1.0
const normalize = (value, min, max) => (value - min) / ((max - min) || 1)

function makeContext(movies, users) {
    const ages = users.map(u => u.age)
    const durations = movies.map(m => m.duration)
    const years = movies.map(m => m.year)
    const ratings = movies.map(m => m.rating)

    const minAge = Math.min(...ages)
    const maxAge = Math.max(...ages)

    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)

    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)

    const minRating = Math.min(...ratings)
    const maxRating = Math.max(...ratings)

    const categories = [...new Set(movies.map(m => m.category))]
    const genres = [...new Set(movies.flatMap(m => m.genres))]
    const directors = [...new Set(movies.map(m => m.director))]

    const categoriesIndex = Object.fromEntries(
        categories.map((category, index) => {
            return [category, index]
        }))

    const genresIndex = Object.fromEntries(
        genres.map((genre, index) => {
            return [genre, index]
        }))
    const directorsIndex = Object.fromEntries(
        directors.map((director, index) => {
            return [director, index]
        }))

    // Computar a média de idade dos que assistiram cada filme
    // (ajuda a personalizar)
    const midAge = (minAge + maxAge) / 2
    const ageSums = {}
    const ageCounts = {}

    users.forEach(user => {
        user.watched.forEach(m => {
            ageSums[m.name] = (ageSums[m.name] || 0) + user.age
            ageCounts[m.name] = (ageCounts[m.name] || 0) + 1
        })
    })

    const movieAvgAgeNorm = Object.fromEntries(
        movies.map(movie => {
            const avg = ageCounts[movie.name] ?
                ageSums[movie.name] / ageCounts[movie.name] :
                midAge

            return [movie.name, normalize(avg, minAge, maxAge)]
        })
    )

    return {
        movies,
        users,
        categoriesIndex,
        genresIndex,
        directorsIndex,
        movieAvgAgeNorm,
        minAge,
        maxAge,
        minDuration,
        maxDuration,
        minYear,
        maxYear,
        minRating,
        maxRating,
        numCategories: categories.length,
        numGenres: genres.length,
        numDirectors: directors.length,
        // duration + year + rating + age + categories + genres + directors
        dimentions: 4 + categories.length + genres.length + directors.length
    }
}

const oneHotWeighted = (index, length, weight) =>
    tf.oneHot(index, length).cast('float32').mul(weight)

function encodeMovie(movie, context) {
    // normalizando dados para ficar de 0 a 1 e
    // aplicar o peso na recomendação
    const duration = tf.tensor1d([
        normalize(
            movie.duration,
            context.minDuration,
            context.maxDuration
        ) * WEIGHTS.duration
    ])

    const year = tf.tensor1d([
        normalize(
            movie.year,
            context.minYear,
            context.maxYear
        ) * WEIGHTS.year
    ])

    const rating = tf.tensor1d([
        normalize(
            movie.rating,
            context.minRating,
            context.maxRating
        ) * WEIGHTS.rating
    ])

    const age = tf.tensor1d([
        (
            context.movieAvgAgeNorm[movie.name] ?? 0.5
        ) * WEIGHTS.age
    ])

    const category = oneHotWeighted(
        context.categoriesIndex[movie.category],
        context.numCategories,
        WEIGHTS.category
    )

    // Multi-hot para múltiplos gêneros
    const genreArray = new Array(context.numGenres).fill(0)
    movie.genres.forEach(genre => {
        genreArray[context.genresIndex[genre]] = WEIGHTS.genre
    })
    const genreVector = tf.tensor1d(genreArray)

    const director = oneHotWeighted(
        context.directorsIndex[movie.director],
        context.numDirectors,
        WEIGHTS.director
    )

    return tf.concat1d(
        [duration, year, rating, age, category, genreVector, director]
    )
}

function encodeUser(user, context) {
    if (user.watched.length) {
        return tf.stack(
            user.watched.map(
                movie => encodeMovie(movie, context)
            )
        )
            .mean(0)
            .reshape([
                1,
                context.dimentions
            ])
    }

    return tf.concat1d(
        [
            tf.zeros([3]), // duration, year, rating ignorados
            tf.tensor1d([
                normalize(user.age, context.minAge, context.maxAge)
                * WEIGHTS.age
            ]),
            tf.zeros([context.numCategories]), // categoria ignorada
            tf.zeros([context.numGenres]), // gêneros ignorados
            tf.zeros([context.numDirectors]), // diretores ignorados

        ]
    ).reshape([1, context.dimentions])
}

function createTrainingData(context) {
    const inputs = []
    const labels = []
    context.users
        .filter(u => u.watched.length)
        .forEach(user => {
            const userVector = encodeUser(user, context).dataSync()
            context.movies.forEach(movie => {
                const movieVector = encodeMovie(movie, context).dataSync()

                const label = user.watched.some(
                    watched => watched.name === movie.name ?
                        1 :
                        0
                )
                // combinar user + movie
                inputs.push([...userVector, ...movieVector])
                labels.push(label)

            })
        })

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimention: context.dimentions * 2
        // tamanho = userVector + productVector
    }
}

// ====================================================================
// 📌 Exemplo de como um usuário é ANTES da codificação
// ====================================================================
/*
const exampleUser = {
    id: 201,
    name: 'Rafael Souza',
    age: 27,
    watched: [
        { id: 1, name: 'Vingadores: Ultimato', category: 'ação', duration: 181, year: 2019, rating: 8.4, genres: ['ação', 'ficção', 'aventura'], director: 'Russo Brothers' },
        { id: 2, name: 'Interestelar', category: 'ficção', duration: 169, year: 2014, rating: 8.6, genres: ['ficção', 'drama', 'aventura'], director: 'Christopher Nolan' }
    ]
};
*/

// ====================================================================
// 📌 Após a codificação, o modelo NÃO vê nomes ou palavras.
// Ele vê um VETOR NUMÉRICO (todos normalizados entre 0–1).
// Exemplo: [duração_norm, ano_norm, rating_norm, idade_média_norm, cat_one_hot..., genre_multi_hot..., director_one_hot...]
//
// Suponha categorias = ['ação', 'ficção', 'animação', 'drama']
// Suponha gêneros    = ['ação', 'ficção', 'aventura', 'drama', 'suspense']
// Suponha diretores  = ['Russo Brothers', 'Christopher Nolan']
//
// Para Rafael (assistiu Vingadores + Interestelar),
// o vetor poderia ficar assim:
//
// [
//   0.10,            // duração normalizada
//   0.08,            // ano normalizado
//   0.13,            // rating normalizado
//   0.06,            // idade média normalizada
//   0.25, 0.25, 0, 0,// one-hot de categoria (ação + ficção)
//   0.2, 0.2, 0.2, 0.2, 0, // multi-hot de gêneros
//   0.1, 0.1         // one-hot de diretores
// ]
//
// São esses números que vão para a rede neural.
// ====================================================================



// ====================================================================
// 🧠 Configuração e treinamento da rede neural
// ====================================================================
async function configureNeuralNetAndTrain(trainData) {

    const model = tf.sequential()
    // Camada de entrada
    // - inputShape: Número de features por exemplo de treino (trainData.inputDimention)
    //   Exemplo: Se o vetor filme + usuário = 30 números, então inputDim = 30
    // - units: 128 neurônios (muitos "olhos" para detectar padrões)
    // - activation: 'relu' (mantém apenas sinais positivos, ajuda a aprender padrões não-lineares)
    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimention],
            units: 128,
            activation: 'relu'
        })
    )
    // Camada oculta 1
    // - 64 neurônios (menos que a primeira camada: começa a comprimir informação)
    // - activation: 'relu' (ainda extraindo combinações relevantes de features)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    )

    // Camada oculta 2
    // - 32 neurônios (mais estreita de novo, destilando as informações mais importantes)
    //   Exemplo: De muitos sinais, mantém apenas os padrões mais fortes
    // - activation: 'relu'
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    )
    // Camada de saída
    // - 1 neurônio porque vamos retornar apenas uma pontuação de recomendação
    // - activation: 'sigmoid' comprime o resultado para o intervalo 0–1
    //   Exemplo: 0.9 = recomendação forte, 0.1 = recomendação fraca
    model.add(
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
    )

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    })

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    accuracy: logs.acc
                });
            }
        }
    })

    return model
}
async function trainModel({ users }) {
    console.log('Training model with users:', users);
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 1 } });
    const movies = await (await fetch('/data/movies.json')).json()

    const context = makeContext(movies, users)
    context.movieVectors = movies.map(movie => {
        return {
            name: movie.name,
            meta: { ...movie },
            vector: encodeMovie(movie, context).dataSync()
        }
    })

    _globalCtx = context

    const trainData = createTrainingData(context)
    _model = await configureNeuralNetAndTrain(trainData)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}
function recommend({ user }) {
    if (!_model) return;
    const context = _globalCtx
    // 1️⃣ Converta o usuário fornecido no vetor de features codificadas
    //    (duração/ano/rating ignorados, idade normalizada, categorias/gêneros/diretores ignorados)
    //    Isso transforma as informações do usuário no mesmo formato numérico
    //    que foi usado para treinar o modelo.

    const userVector = encodeUser(user, context).dataSync()

    // Em aplicações reais:
    //  Armazene todos os vetores de filmes em um banco de dados vetorial (como Postgres, Neo4j ou Pinecone)
    //  Consulta: Encontre os 200 filmes mais próximos do vetor do usuário
    //  Execute _model.predict() apenas nesses filmes

    // 2️⃣ Crie pares de entrada: para cada filme, concatene o vetor do usuário
    //    com o vetor codificado do filme.
    //    Por quê? O modelo prevê o "score de compatibilidade" para cada par (usuário, filme).


    const inputs = context.movieVectors.map(({ vector }) => {
        return [...userVector, ...vector]
    })

    // 3️⃣ Converta todos esses pares (usuário, filme) em um único Tensor.
    //    Formato: [numFilmes, inputDim]
    const inputTensor = tf.tensor2d(inputs)

    // 4️⃣ Rode a rede neural treinada em todos os pares (usuário, filme) de uma vez.
    //    O resultado é uma pontuação para cada filme entre 0 e 1.
    //    Quanto maior, maior a probabilidade do usuário gostar daquele filme.
    const predictions = _model.predict(inputTensor)

    // 5️⃣ Extraia as pontuações para um array JS normal.
    const scores = predictions.dataSync()
    const recommendations = context.movieVectors.map((item, index) => {
        return {
            ...item.meta,
            name: item.name,
            score: scores[index] // previsão do modelo para este filme
        }
    })

    const sortedItems = recommendations
        .sort((a, b) => b.score - a.score)

    // 8️⃣ Envie a lista ordenada de filmes recomendados
    //    para a thread principal (a UI pode exibi-los agora).
    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems
    });

}
const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: recommend,
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
