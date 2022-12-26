const db = require('./config.js')
const COLLECTIONS = require('./collections.js');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    addProduct: (product, callback) => {
        try {
            db.get().collection(COLLECTIONS.PRODUCTS).insertOne(product).then((data) => {
                callback(data.insertedId.toString());
            });
        } catch (err) {
            console.error(err)
        }
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(COLLECTIONS.PRODUCTS).find().toArray()
                if (products) {
                    resolve(products);
                } else {
                    reject(false)
                }
            } catch (err) {
                console.error(err)
            }
        });
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(COLLECTIONS.ORDERS).find().toArray();
                resolve(products);
            } catch (err) {
                console.error(err)
            }
        });
    },
    getCartItems: (userId) => {
        return new Promise(async (resolve) => {
            try {
                let cart = await db.get().collection(COLLECTIONS.CART)
                    .aggregate([{ $match: { user: ObjectId(userId) } },
                    {
                        $project: { products: 1, _id: 0 }
                    }]).toArray()
                let count = 0
                if (cart[0]) {
                    count = cart[0].products.length
                }
                resolve(count)
            } catch (err) {
                console.error(err)
            }
        })
    },
    findProduct: (prodId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let proObjId = ObjectId(prodId);
                let product = await db.get().collection(COLLECTIONS.PRODUCTS).findOne({ _id: proObjId });
                if (product) {
                    resolve(product);
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.error(err)
            }
        });
    },
    delProd: (prodId) => {
        return new Promise(async (resolve) => {
            try {
                db.get().collection(COLLECTIONS.PRODUCTS).deleteOne({ _id: ObjectId(prodId) }, (err, data) => {
                    if (!err) resolve(true)
                })
            } catch (err) {
                console.error(err)
            }
        })
    },
    upProd: (prodId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(COLLECTIONS.PRODUCTS).updateOne({ _id: ObjectId(prodId) }).then((product) = {
                    if(product) {
                        resolve(true);
                    }
                }).catch((err) => {
                    reject(false)
                });
            } catch (err) {
                console.error(err)
            }
        });
    },
    getPlaced: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(COLLECTIONS.PLACED).findOne({ userId: ObjectId(userId) }).then((placed) => {
                    resolve(placed)
                }).catch((err) => { console.error(err) })
            } catch (err) {
                console.error(err)
            }
        })
    },
    updateCart: (productId, userId) => {
        let proObject = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve) => {
            const userCart = await db.get().collection(COLLECTIONS.CART).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId);
                if (proExist != -1) {
                    db.get().collection(COLLECTIONS.CART)
                        .updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) }, {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve();
                        });
                } else {
                    db.get().collection(COLLECTIONS.CART)
                        .updateOne({ user: ObjectId(userId) }, {
                            $push: {
                                products: proObject
                            }
                        }).then((response) => {
                            resolve();
                        });
                }
            } else {
                const cart = {
                    user: ObjectId(userId),
                    products: [proObject]
                }
                db.get().collection(COLLECTIONS.CART).insertOne(cart, (err, done) => {
                    resolve()
                })
            }
        })
    },
    getProduct: (prod_id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(COLLECTIONS.PRODUCTS).findOne({ _id: ObjectId(prod_id) }).then((product) => {
                resolve(product)
            })
        })
    },
    addFav: (productId, userId) => {
        let proObject = {
            item: ObjectId(productId),
            user: ObjectId(userId),
            product: {}
        }
        return new Promise((resolve) => {
            db.get().collection(COLLECTIONS.PRODUCTS).findOne({ _id: ObjectId(productId) }).then((product) => {
                proObject.product = product;
                db.get().collection(COLLECTIONS.FAV).findOne({ user: ObjectId(userId) }).then((favItem) => {
                    if (favItem) {
                        db.get().collection(COLLECTIONS.FAV).deleteOne({ item: ObjectId(productId) }).then((res) => {
                            resolve(true)
                        }).catch((err) => {
                            console.error(err)
                        })
                    } else {
                        db.get().collection(COLLECTIONS.FAV).insertOne(proObject).then((res) => {
                            resolve(true)
                        }).catch((err) => {
                            console.error(err)
                        })
                    }
                })
            })
        }).then((res) => {
            resolve(true)
        }).catch((err) => {
            console.error(err)
        })
    },
    getFav: (userId) => {
        return new Promise(async (resolve) => {
            let fav = await db.get().collection(COLLECTIONS.FAV).find({ user: ObjectId(userId) }).toArray();
            resolve(fav)
        })
    },
    succesOrder: (order) => {
        return new Promise((resolve) => {
            let orderData = {
                details: order.deliveryDetails,
                user_id: order.userId,
                payment: order.paymentMethod,
                amount: order.tottalAmount,
                products: order.products
            };
            db.get().collection(COLLECTIONS.PLACED).insertOne(orderData).then((response) => {
                db.get().collection(COLLECTIONS.ORDERS).deleteOne({ _id: ObjectId(order._id) }).then((response) => {
                    resolve(true)
                })
            })
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve) => {
            let cart = await db.get().collection(COLLECTIONS.CART)
                .aggregate([{
                    $match: { user: ObjectId(userId) }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: COLLECTIONS.PRODUCTS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }]).toArray()
            resolve(cart);
        })
    },
    removeCartItem: (cartId, prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(COLLECTIONS.CART).updateOne({ _id: ObjectId(cartId), user: ObjectId(userId) },
                {
                    $pull: { products: { item: ObjectId(prodId) } }
                }).then((response) => {
                    resolve({ removeProduct: true });
                });
        });
    },
    editProd: (prodId, prodData) => {
        return new Promise((resolve, reject) => {
            let product = db.get().collection(COLLECTIONS.PRODUCTS).updateOne({ _id: ObjectId(prodId) }, {
                $set: {
                    title: prodData.title,
                    description: prodData.description,
                    category: prodData.category,
                    oldPrice: prodData.oldPrice,
                    price: prodData.price,
                    delivery: prodData.delivery
                }
            }).then((response) => {
                resolve(true);
            });
        });
    },
    changeQuantity: (details) => {
        return new Promise((resolve, reject) => {
            details.count = parseInt(details.count);
            details.quantity = parseInt(details.quantity);
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(COLLECTIONS.CART).updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true });
                    });
            } else {
                db.get().collection(COLLECTIONS.CART).updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) }, {
                    $inc: { 'products.$.quantity': details.count }
                }).then(() => {
                    resolve(true);
                });
            }
        });
    },
    tottalAmount: (userId) => {
        return new Promise(async (resolve) => {
            let total = await db.get().collection(COLLECTIONS.CART).aggregate([{
                $match: { user: ObjectId(userId) }
            }, {
                $unwind: '$products'
            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            }, {
                $lookup: {
                    from: COLLECTIONS.PRODUCTS,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    item: 1,
                    quantity: 1,
                    product: {
                        $arrayElemAt: ['$product', 0]
                    }
                }
            }, {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.price', to: "int" } }] } }
                }
            }]).toArray()
            if (total.length) {
                resolve(total[0].total);
            } else {
                resolve(0);
            }
        })
    },
    deliveryCharge: (userId) => {
        return new Promise(async (resolve) => {
            let charge = await db.get().collection(COLLECTIONS.CART)
                .aggregate([{
                    $match: { user: ObjectId(userId) }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: COLLECTIONS.PRODUCTS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.delivery_charge', to: "int" } }] } }
                    }
                }]).toArray()
            if (charge.length) {
                resolve(charge[0].total);
            } else {
                resolve(0);
            }
        })
    },
    placeOrder: (order, product, total, user) => {
        return new Promise((resolve, reject) => {
            product.quantity = order.quantity ? order.quantity : 1;
            let orderObj = {
                deliveryDetails: {
                    name: order.firstname + ' ' + order.lastname,
                    mobile: order.phonenumber,
                    email: user.email,
                    adress: order.adress,
                    post: order.po,
                    pincode: order.pincode,
                    city: order.city,
                    state: order.state,
                    country: 'INDIA'
                },
                userId: ObjectId(user._id),
                paymentMethod: 'online',
                product: product,
                tottalAmount: total,
                status: false,
                date: new Date()
            }
            db.get().collection(COLLECTIONS.PENDING).insertOne(orderObj).then((response) => {
                resolve(response)
            });
        });
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(COLLECTIONS.CART).findOne({ user: ObjectId(userId) });
            resolve(cart);
        });
    },
    getOrders: (user) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(COLLECTIONS.ORDERS).find({ userId: ObjectId(user._id) }).toArray();
            if (orders) {
                resolve(orders);
            } else {
                resolve(false)
            }
        });
    },
    getUserOrders: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(COLLECTIONS.ORDERS).find({ _id: ObjectId(orderId) }).toArray();
            if (orders) {
                resolve(orders);
            } else {
                resolve(false)
            }
        });
    },
    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(COLLECTIONS.ORDERS).deleteOne({ _id: ObjectId(orderId) }).then((response) => {
                resolve(true);
            })
        });
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(COLLECTIONS.ORDERS).aggregate([{
                $match: {
                    _id: ObjectId(orderId)
                }
            }, {
                $unwind: '$product'
            }, {
                $project: {
                    item: '$product.item',
                    quantity: '$product.quantity'
                }
            }, {
                $lookup: {
                    from: COLLECTIONS.PRODUCTS,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    item: 1,
                    quantity: 1,
                    product: {
                        $arrayElemAt: ['$product', 0]
                    }
                }
            }]).toArray()
            resolve(orderItems);
        })
    },
    searchProduct: (query) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ category: query }).toArray();
            if (products.length < 1) {
                products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ title: query }).toArray();
                if (products.length < 1) {
                    products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ price: query }).toArray();
                    if (products.length < 1) {
                        products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ oldPrice: query }).toArray();
                        if (products.length < 1) {
                            products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ description: query }).toArray();
                            if (products.length < 1) {
                                products = await db.get().collection(COLLECTIONS.PRODUCTS).find({ delivery: query }).toArray();
                            }
                        }
                    }
                }
            }
            resolve(products)
        });
    }
}