import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
export const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function createPreference({ customer, orderId, total }: any) {
  const pref = new Preference(mp)
  return pref.create({ body: {
    items: [{ id:orderId, title:'Pedido MAKANGRU', unit_price:Number(total), quantity:1, currency_id:'CLP' }],
    payer: { name:customer.first_name, surname:customer.last_name, email:customer.email },
    back_urls: {
      success:`${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      failure:`${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
      pending:`${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    },
    auto_return:'approved',
    notification_url:`${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/webhook`,
    external_reference:orderId,
    statement_descriptor:'MAKANGRU',
  }})
}

export async function getPayment(id:string) {
  return new Payment(mp).get({ id })
}
