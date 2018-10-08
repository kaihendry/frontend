const config = require('./config')
const stripe = require('stripe')(config.stripe.secretKey)
stripe.setApiVersion(config.stripe.apiVersion)
const {orders} = require('./inventory')

export default async (req, res) => {
  let {currency, items, email, shipping} = req.body
  try {
    let order = await orders.createOrder(currency, items, email, shipping)
    return res.status(200).json({order})
  } catch (err) {
    return res.status(500).json({error: err.message})
  }
}
