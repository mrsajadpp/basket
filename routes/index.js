var express = require('express');
var router = express.Router();
let userData = require('../database/user_data')
let prodData = require('../database/product_data')
let generateOTP = require('../mail/otp')
let mail = require('../mail/mailer');
let mailTemp = require('../mail/temp.js');
const { response } = require('express');
let fs = require('fs')

function verifyLogin(req, res, next) {
  if (req.session.status) {
    next()
  } else {
    res.redirect('/login')
  }
}
function verifyAdmin(req, res, next) {
  if (req.session.status && req.session.user.admin) {
    next()
  } else {
    res.redirect('/')
  }
}
function cartCount(req, res, next) {
  try {
    if (req.session.status) {
      prodData.getCartItems(req.session.user._id).then((cartCount) => {
        req.session.user.cartCount = cartCount
        next()
      })
    } else {
      req.session.user = {}
      req.session.user.cartCount = false
      next()
    }
  } catch (err) {
    console.error(err)
  }
}
//Home Page
router.get('/', cartCount, function (req, res, next) {
  try {
    prodData.getAllProducts().then((products) => {
      res.render('user/products', { title: 'Home', descripion: 'Electronics shopping website', style: 'products', script: 'products', products, user: req.session.user, status: req.session.status });
    })
  } catch (err) {
    console.error(err)
  }
});
//Account
router.get('/recover', (req, res, next) => {
  try {
    if (!req.session.status) {
      res.render('user/recover', { title: 'Reset Password', descripion: 'Reset your password', style: 'login', script: 'login', hide: true })
    } else {
      res.redirect('/')
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/login', (req, res) => {
  try {
    if (!req.session.status) {
      res.render('user/login', { title: 'LogIn', descripion: 'Login with your existing account', style: 'login', script: 'login', hide: true })
    } else {
      res.redirect('/')
    }
  } catch (err) {
    console.error(err)
  }
})
router.post('/login', (req, res, next) => {
  try {
    if (!req.session.status) {
      userData.findUser(req.body).then((result) => {
        req.session.status = result.loginStatus;
        req.session.user = result.user;
        res.redirect('/')
      }).catch((err) => {
        res.render('user/login', { title: 'LogIn', descripion: 'Login with your existing account', style: 'login', script: 'login', hide: true, error: 'Your entered data is not match.' })
      })
    } else {
      res.redirect('/')
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/signup', (req, res) => {
  try {
    if (!req.session.status) {
      res.render('user/signup', { title: 'SignUp', descripion: 'Create new account in basket', style: 'login', script: 'login', hide: true })
    } else {
      res.redirect('/')
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/logout', verifyLogin, (req, res) => {
  try {
    req.session.status = false
    req.session.user = null
    res.redirect('/login')
  } catch (err) {
    console.error(err)
  }
})
router.post('/signup', async (req, res, next) => {
  let user = await {
    data: req.body,
    date: new Date(),
    otp: generateOTP()
  }
  userData.createPendingUser(user).then((uid) => {
    res.redirect('/signup/verify/' + uid._id)
    mail({
      email: uid.email,
      title: 'Login with your OTP.',
      text: 'Your OTP : ' + user.otp,
      content: mailTemp.otpTemp({ otp: otp })
    })
  }).catch((uid) => {
    res.redirect('/signup/verify/' + uid._id)
    mail({
      email: uid.email,
      title: 'Login with your OTP.',
      text: 'Your OTP : ' + user.otp,
      content: mailTemp.otpTemp({ otp: uid.otp })
    })
  })
})
router.get('/signup/verify/:uid', (req, res, next) => {
  try {
    if (!req.session.status) {
      if (req.params.uid) {
        res.render('user/otp', { title: 'Otp', descripion: 'Enter your otp.', style: 'login', script: 'login', hide: true, uid: req.params.uid })
      }
    } else {
      res.redirect('/')
    }
  } catch (err) {
    console.error(err)
  }
})
router.post('/checkname', (req, res, next) => {
  try {
    userData.findUserName(req.body.username).then((response) => {
      res.json({ response })
    })
  } catch (err) {
    console.error(err)
  }
})
router.post('/verifyotp', (req, res, next) => {
  try {
    if (req.body.uid) {
      userData.findPendingUser(req.body.uid).then((user) => {
        if (user) {
          if (req.body.otp == user.otp) {
            userData.createUser(user._id).then((user) => {
              if (user) {
                req.session.user = user
                req.session.status = true
                res.redirect('/')
              } else {
                res.redirect('/signup')
              }
            }).catch((err) => {
              res.redirect('/login')
            })
          } else {
            res.redirect('/signup')
          }
        } else {
          res.redirect('/signup')
        }
      })
    } else {
      res.redirect('/signup')
    }
  } catch (err) {
    console.error(err)
  }
})
//Admin
router.get('/add', verifyLogin, verifyAdmin, (req, res, next) => {
  try {
    res.render('admin/addprod', { title: 'Add product', descripion: 'Add new product in basket', style: 'addprod', hide: true, user: req.session.user, status: req.session.status })
  } catch (err) {
    console.error(err)
  }
})
router.post('/add', verifyLogin, verifyAdmin, (req, res, next) => {
  try {
    if (req.body && req.files) {
      let data = req.body;
      let files = req.files;
      let product = {
        title: data.title,
        description: data.description,
        size: [],
        price: data.price,
        old_price: data.oldprice,
        delivery_charge: data.delivery,
        images: files.images.length
      }
      if (data.size) {
        for (let i = 0; i < data.size.length; i++) {
          product.size.push({
            type: data.size[i]
          })
        }
      }
      prodData.addProduct(product, (id) => {
        if (product.images > 0) {
          for (let i = 0; i < product.images; i++) {
            fs.mkdirSync('./public/images/products/' + id, { recursive: true });
            files.images[i].mv('./public/images/products/' + id + '/' + i + '.jpeg');
          }
          res.redirect('/products')
        } else {
          fs.mkdirSync('./public/images/products/' + id, { recursive: true });
          files.images.mv('./public/images/products/' + id + '/0.jpeg', (err, done) => {
            if (!err) {
              res.redirect('/products')
            } else {
              res.redirect('/add')
            }
          });
        }
      })
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/product/:prod_id', cartCount, (req, res, next) => {
  try {
    if (req.params.prod_id) {
      prodData.getProduct(req.params.prod_id).then((response) => {
        res.render('user/product', { title: response.title, descripion: response.description.slice(0, 20), style: 'product', script: 'product', preImg: `/images/products/${response._id}/0.jpeg`, product: response, user: req.session.user, status: req.session.status })
      }).catch((err) => {
        if (err) {
          res.redirect('/')
        }
      })
    }
  } catch (err) {
    console.error(err)
  }
})
// cart section
router.get('/addcart/:prodId', verifyLogin, cartCount, (req, res, next) => {
  try {
    if (req.params.prodId) {
      prodData.updateCart(req.params.prodId, req.session.user._id).then((response) => {
        res.redirect('/cart')
      }).catch((err) => {
        console.error(err)
      })
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/cart', verifyLogin, cartCount, (req, res, next) => {
  try {
    prodData.getCartProducts(req.session.user._id).then((cart) => {
      prodData.tottalAmount(req.session.user._id).then((totalAmount) => {
        prodData.deliveryCharge(req.session.user._id).then((deliveryCharge) => {
          res.render('user/cart', { title: 'Cart', descripion: 'Your cart items', cart, totalAmount, deliveryCharge, user: req.session.user, style: 'cart', script: 'cart' })
        }).catch((err) => {
          console.error(err)
        })
      }).catch((err) => {
        console.error(err)
      })
    }).catch((err) => {
      console.error(err)
    })
  } catch (err) {
    console.error(err)
  }
})
router.post('/quantity', (req, res, next) => {
  try {
    prodData.changeQuantity(req.body).then((res) => {
      res.redirect('/cart')
    }).catch((err) => {
      res.redirect('/cart')
    })
  } catch (err) {
    console.error(err)
  }
})

//fav section
router.get('/fav/:prodId', verifyLogin, cartCount, (req, res, next) => {
  try {
    if (req.params.prodId) {
      prodData.addFav(req.params.prodId, req.session.user._id).then((response) => {
        res.redirect('/fav')
      }).catch((err) => {
        console.error(err)
      })
    }
  } catch (err) {
    console.error(err)
  }
})
router.get('/fav', verifyLogin, cartCount, (req, res, next) => {
  try {
    prodData.getFav(req.session.user._id).then((fav) => {
      res.render('user/fav', { title: 'Favourites', descripion: 'Your favourites', fav, user: req.session.user, status: req.session.status, style: 'fav', script: 'cart' })
    }).catch((err) => {
      console.error(err)
    })
  } catch (err) {
    console.error(err)
  }
})
router.get('/removefav/:prodId', verifyLogin, (req, res, next) => {
  try {
    if (req.params.prodId) {
      prodData.addFav(req.params.prodId, req.session.user._id).then((response) => {
        res.redirect('/fav')
      }).catch((err) => {
        console.error(err)
      })
    }
  } catch (err) {
    console.error(err)
  }
})

//buy product
router.get('/buy/:userId', verifyLogin, (req, res, next) => {
  try {
    prodData.getCartProducts(req.session.user._id).then((items) => {
      prodData.tottalAmount(req.session.user._id).then((amount) => {
        prodData.deliveryCharge(req.session.user._id).then((charge) => {
          for (let index = 0; index < items.length; index++) {
            items[index].product.delivery_charge = parseInt(items[index].product.delivery_charge) * parseInt(items[index].quantity);
            items[index].product.price = parseInt(items[index].product.price) * parseInt(items[index].quantity);
          }
          res.render('user/adress', { title: 'Adress', descripion: 'Enter your delivery adress', products: items, amount, charge, tottal: amount + charge, user: req.session.user, status: req.session.status, style: 'addprod', script: 'cart', hide: true })
        })
      })
    })
  } catch (err) {
    console.error(err)
  }
})
router.post('/placeorder', verifyLogin, (req, res, next) => {
  try {
    prodData.getCartProducts(req.session.user._id).then((products) => {
      prodData.tottalAmount(req.session.user._id).then((tottalAmount) => {
        prodData.deliveryCharge(req.session.user._id).then((charge) => {
          prodData.placeOrder(req.body, products, tottalAmount + charge, req.session.user).then((orderId) => {
            userData.generateRazorpay(orderId.insertedId.toString(), tottalAmount + charge, req.session.user._id).then((response) => {
              res.json({ response, data: req.body, userId: req.session.user._id, orderId });
            }).catch((err) => {
              res.redirect('/status/false')
            })
          })
        })
      })
    })
  } catch (err) {
    console.error(err)
  }
})
router.post('/verifypayment', verifyLogin, (req, res, next) => {
  try {
    userData.verifyPayment(req.body, req.session.user._id).then((response) => {
      userData.changePaymentStatus(req.body['order[receipt]']).then(() => {
        userData.doFind(req.session.user._id).then((user) => {
          mail({
            email: 'mrsajadpp@gmail.com',
            title: 'New order from ' + user.user.username + '.',
            text: 'New order registered.',
            content: mailTemp.neOrdTemp({ user, order: {
              orderId: req.body.orderId
            } })
          })
          mail({
            email: user.user.email,
            title: 'Your order placed.',
            text: 'Your order was placed succesfully.',
            content: mailTemp.suOrdTemp({ order: {
              orderId: req.body.orderId
            } })
          })
        });
        res.json(response);
      });
    });
  } catch (err) {
    console.error(err)
  }
});

//orders
router.get('/orders', verifyLogin, (req, res, next) => {
  try {
    prodData.getOrders(req.session.user).then((orders) => {
      res.render('user/orders', { title: 'Orders', descripion: 'Your orders', orders, user: req.session.user, status: req.session.status, style: 'orders', script: 'cart' })
    }).catch((err) => { console.error(err) })
  } catch (err) {
    console.error(err)
  }
})
router.get('/order/list/:orderId', verifyLogin, (req, res, next) => {
  try {
    prodData.getOrderProducts(req.params.orderId).then((orders) => {
      res.render('user/prodlist', { title: 'Order products', descripion: 'Your order products', orders, user: req.session.user, status: req.session.status, style: 'orders', script: 'cart', hide: true })
    }).catch((err) => { console.error(err) })
  } catch (err) {
    console.error(err)
  }
})
router.get('/order/cancel/:orderId', verifyLogin, (req, res, next) => {
  try {
    prodData.getUserOrders(req.params.orderId).then((order) => {
      userData.doFind(order[0].userId).then((user) => {
        mail({
          email: 'mrsajadpp@gmail.com',
          title: 'Order cancellation request from ' + user.user.username + '.',
          text: 'Order cancellation.',
          content: mailTemp.caOrdTemp({ user, order: {
            orderId: order[0]._id
          } })
        })
        res.redirect('user/requested', { title: 'Request', descripion: 'Request send succefull', style: 'status', hide: true, user: req.session.user, status: req.session.status })
      })
    })
  } catch (err) {
    console.error(err)
  }
})

router.get('/placed', verifyLogin, (req, res, next) => {
  try {
    prodData.getPlaced(req.session.user._id).then((placed) => {
      res.render('user/placed', { tite: 'Placed Orders', placed, user: req.session.user, status: req.session.status, description: 'Your placed orders', style: 'orders' })
    })
  } catch (err) {
    console.error(err)
  }
})

//status
router.get('/status/:status', verifyLogin, (req, res, next) => {
  if (req.params.status == 'true') {
    res.render('user/succes', { title: 'Pyment Success', user: req.session.user, style: 'status', hide: true })
  } else {
    res.render('user/faile', { title: 'Pyment Faied', user: req.session.user, style: 'status', hide: true })
  }
})

//about
router.get('/about', (req, res, next) => {
  try {
    res.render('user/about', { title: 'About Basket', user: req.session.user, style: 'about', hide: true })
  } catch (err) {
    console.error(err)
  }
})

//robots.txt
router.get('/robots.txt', (req, res, next) => {
  res.type('text/plain')
  res.send("User-Agent: * \n Allow: */ \n Allow: */login \n Allow: */signup \n Allow: */cart \n Allow: */fav \n Allow: */product/* \n Disallow: */products/* \n Disallow: */add")
})

module.exports = router;