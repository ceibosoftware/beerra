const Sale = require('../Models/sale')
const Growler = require('../Models/growler')
const Pint = require('../Models/pint')
const Other = require('../Models/other')
const Keg = require('../Models/keg')
const Bottle = require('../Models/bottle')
const format = require('date-format')

async function createSale(req, res) {
   
    try {
        let sale = new Sale()
        sale.client = req.body.client
        sale.totalSale = req.body.totalSale
        sale.date =  req.body.date  
        let saleStoraged = await sale.save()
        saleStoraged = saveProducts(req.body.growlers, req.body.bottles, req.body.pints, req.body.others,saleStoraged)
        res.status(200).send({
            message: "Venta realizada correctamente",

        })
    } catch (error) {
        res.status(500).send(`Error al procesar la venta  ${error}`)
    }
} 
async function getGrowler(req,res){
    try {
        let growlers = await Growler.find({"sale":req.params.idSale}).populate('keg')
        if(!growlers)
            res.status(404).send({mensaje:"La venta no tiene growlers"})
        res.status(200).send({growlers})
    } catch (error) {
        res.status(500).send(`Error al buscar la venta  ${error}`)
        console.log(error)
    }
   
}
async function getPint(req,res){
    try {   
        let pints = await Pint.find({"sale":req.params.idSale}).populate('keg')
        if(!pints)
            res.status(404).send({mensaje:"La venta no tiene pintas"})
        res.status(200).send({pints})
    } catch (error) {
        res.status(500).send(`Error al buscar la venta  ${error}`)
        console.log(error)
    }
   
}
async function getOther(req,res){
    try {   
        let others = await Other.find({"sale":req.params.idSale}).populate('keg').populate('others')
        if(!others)
            res.status(404).send({mensaje:"La venta no tiene otros"})
        res.status(200).send({others})
    } catch (error) {
        res.status(500).send(`Error al buscar la venta  ${error}`)
        console.log(error)
    }
   
}
async function getBottle(req,res){
    try {
        let bottles = await Sale.findById(req.params.idSale).populate('bottles').populate('brewery')
        if(!bottles)
            res.status(404).send({mensaje:"La venta no tiene botellas"})
        res.status(200).send({bottles})
    } catch (error) {
        res.status(500).send(`Error al buscar la venta  ${error}`)
        console.log(error)
    }
   
}
async function saveProducts(growlers, bottles, pints,other, saleStoraged) {

    if (growlers) {
        for (const element of growlers) {
            growler = new Growler()
            growler.keg = element.keg
            growler.quantity = element.quantity
            growler.price = element.price
            growler.sale = saleStoraged._id
            await growler.save()
            await saleStoraged.growlers.push(growler)
            await saleStoraged.save()
            if(saleStoraged){
                let keg = await Keg.findById(element.keg)
                keg.quantitySaled = (keg.quantitySaled - element.quantity)
                await keg.save()
            }
        }
    }
    if (pints) {
        for (const element of pints) {
            let pint = new Pint()
            pint.keg = element.keg
            pint.quantity = element.quantity
            pint.price = element.price
            pint.sale = saleStoraged._id
            await pint.save()
            await saleStoraged.pints.push(pint)
            await saleStoraged.save()
            if(saleStoraged){
                let keg = await Keg.findById(element.keg)
                keg.quantitySaled = (keg.quantitySaled - element.quantity)
                await keg.save()
            }
        }
    }
    if (bottles) {
        for (const element of bottles) {
            let bottle = await Bottle.findById(element._id)
            bottle.quantity -= element.quantity
            await bottle.save()
            await saleStoraged.bottles.push(element)
            await saleStoraged.save()
        }
    }
    if(other){
        for(const element of other){
            let other = new Other()
            other.keg = element.keg
            other.quantity = element.quantity
            other.price = element.price
            other.sale = saleStoraged._id
            await other.save()
            await saleStoraged.others.push(other)
            await saleStoraged.save()
            if(saleStoraged){
                let keg = await Keg.findById(element.keg)
                keg.quantitySaled = (keg.quantitySaled - element.quantity)
                await keg.save()
            }
        }
    }
    return saleStoraged;
}

async function getSales(req, res) {
    const sales = await Sale.find({}).populate('growlers').populate('pints').populate('bottles')
    if (!sales)
        res.status(404).send({
            message: "No se encontraron ventas"
        })
    res.status(200).send({
        sales
    })

}

module.exports = {
    createSale,
    getSales,
    getGrowler,
    getPint,
    getBottle,
    getOther

}