const redis = require('redis')
const express = require('express')
const {Pool} = require('pg')
const bodyParser = require('body-parser')
const cors = require('cors')

const keys = require('./keys')

// EXPRESS app setup
const app = express()
app.use(cors())

// turn body of POST request to json
app.use(bodyParser.json())

// POSTGRES setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

pgClient.on('error', () => {
  console.log('Lost PR connection ...')
})

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log('err creating table', err))

// Redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi')
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values')

  res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = req.body.index

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high')
  }

  // This should be calculated by worker
  redisClient.hset('values', index, 'Nothing yet!')
  redisPublisher.publish('insert', index) // invoke worker

  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

  res.send({working: true})
})

app.listen(5000, (err) => {
  console.log('Listening on port 5000')
})
