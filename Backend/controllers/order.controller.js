const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Profile = require('../models/Profile');

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, shipping_cost, total_amount, address_id, address } = req.body;

    // Handle address - create if provided directly, otherwise use address_id
    let finalAddressId = address_id;
    if (address && !address_id) {
      const newAddress = await Address.create({
        user_id: req.user.id,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
        is_default: false,
      });
      finalAddressId = newAddress._id;
    }

    // Create order items with product population
    const orderItems = await OrderItem.insertMany(
      items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      }))
    );

    // Generate order number
    const orderNumber = "FF" + Date.now().toString().padStart(13, '0');

    // Determine payment method based on payment status or default to razorpay
    // Frontend will send payment_method in body if COD
    const paymentMethod = req.body.payment_method || "razorpay";
    
    const order = await Order.create({
      order_number: orderNumber,
      user_id: req.user.id,
      shipping_address_id: finalAddressId,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      order_status: "created",
      subtotal,
      shipping_cost,
      total_amount,
      items: orderItems.map(i => i._id)
    });

    // Populate and return in frontend format
    const populated = await Order.findById(order._id)
      .populate('user_id')
      .populate({
        path: 'items',
        populate: { path: 'product_id' }
      })
      .populate('shipping_address_id');

    // Transform to match frontend format
    const transformedOrder = {
      _id: populated._id,
      order_number: populated.order_number,
      payment_status: populated.payment_status,
      order_status: populated.order_status,
      total_amount: populated.total_amount,
      items: populated.items.map(item => ({
        product_id: {
          _id: item.product_id._id,
          name: item.product_id.name,
          image: item.product_id.image,
          price: item.price_at_purchase,
        },
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
      shipping_address: populated.shipping_address_id ? {
        name: populated.shipping_address_id.street?.split(',')[0] || '',
        phone: '',
        street: populated.shipping_address_id.street,
        city: populated.shipping_address_id.city,
        state: populated.shipping_address_id.state,
        pincode: populated.shipping_address_id.pincode,
      } : undefined,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    };

    res.status(201).json(transformedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message || 'Error creating order' });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate({
        path: 'items',
        populate: { path: 'product_id' }
      })
      .populate('shipping_address_id')
      .sort({ createdAt: -1 });
    
    // Transform to match frontend format
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      order_status: order.order_status,
      total_amount: order.total_amount,
      items: order.items.map(item => ({
        product_id: {
          _id: item.product_id._id,
          name: item.product_id.name,
          image: item.product_id.image,
          price: item.price_at_purchase,
        },
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
      shipping_address: order.shipping_address_id ? {
        name: order.shipping_address_id.street?.split(',')[0] || '',
        phone: '',
        street: order.shipping_address_id.street,
        city: order.shipping_address_id.city,
        state: order.shipping_address_id.state,
        pincode: order.shipping_address_id.pincode,
      } : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id')
      .populate({
        path: 'items',
        populate: { path: 'product_id' }
      })
      .populate('shipping_address_id')
      .sort({ createdAt: -1 });

    // Get profiles for all users
    const userIds = [...new Set(orders.map(o => o.user_id?._id?.toString()).filter(Boolean))];
    const profiles = await Profile.find({ user_id: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));

    // Transform to match admin format
    const transformedOrders = orders.map(order => {
      const profile = profileMap.get(order.user_id?._id?.toString()) || {};
      return {
        _id: order._id,
        order_number: order.order_number,
        user_id: {
          _id: order.user_id._id,
          name: profile.name || order.user_id.email.split('@')[0],
          email: order.user_id.email,
        },
        payment_status: order.payment_status,
        order_status: order.order_status,
        total_amount: order.total_amount,
        items: order.items.map(item => ({
          product_id: {
            _id: item.product_id._id,
            name: item.product_id.name,
            image: item.product_id.image,
            price: item.price_at_purchase,
          },
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
        })),
        shipping_address: order.shipping_address_id ? {
          name: '',
          phone: '',
          street: order.shipping_address_id.street,
          city: order.shipping_address_id.city,
          state: order.shipping_address_id.state,
          pincode: order.shipping_address_id.pincode,
        } : undefined,
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: order.razorpay_payment_id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { order_status: req.body.status },
      { new: true }
    )
      .populate('user_id')
      .populate({
        path: 'items',
        populate: { path: 'product_id' }
      })
      .populate('shipping_address_id');
    console.log(req.body.status)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get profile for user
    const profile = await Profile.findOne({ user_id: order.user_id._id }) || {};
    
    // Transform to match admin format
    const transformedOrder = {
      _id: order._id,
      order_number: order.order_number,
      user_id: {
        _id: order.user_id._id,
        name: profile.name || order.user_id.email.split('@')[0],
        email: order.user_id.email,
      },
      payment_status: order.payment_status,
      order_status: order.order_status,
      total_amount: order.total_amount,
      items: order.items.map(item => ({
        product_id: {
          _id: item.product_id._id,
          name: item.product_id.name,
          image: item.product_id.image,
          price: item.price_at_purchase,
        },
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
      shipping_address: order.shipping_address_id ? {
        name: '',
        phone: '',
        street: order.shipping_address_id.street,
        city: order.shipping_address_id.city,
        state: order.shipping_address_id.state,
        pincode: order.shipping_address_id.pincode,
      } : undefined,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ message: error.message || 'Error updating order status' });
  }
};


exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Only allow COD logic here
    if (!['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid COD payment status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure this endpoint is used ONLY for COD orders
    if (order.payment_method !== 'cod') {
      return res.status(400).json({
        message: 'This endpoint is only for COD orders'
      });
    }

    order.payment_status = status;

    if (status === 'paid' && order.order_status === 'delivered') {
      order.order_status = 'confirmed';
    }

    await order.save();

    // Populate for response
    const populated = await Order.findById(order._id)
      .populate('user_id')
      .populate({
        path: 'items',
        populate: { path: 'product_id' }
      })
      .populate('shipping_address_id');

    // Profile lookup
    const profile = await Profile.findOne({ user_id: populated.user_id._id }) || {};

    const transformedOrder = {
      _id: populated._id,
      order_number: populated.order_number,
      user_id: {
        _id: populated.user_id._id,
        name: profile.name || populated.user_id.email.split('@')[0],
        email: populated.user_id.email,
      },
      payment_method: populated.payment_method,
      payment_status: populated.payment_status,
      order_status: populated.order_status,
      total_amount: populated.total_amount,
      items: populated.items.map(item => ({
        product_id: {
          _id: item.product_id._id,
          name: item.product_id.name,
          image: item.product_id.image,
          price: item.price_at_purchase,
        },
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
      shipping_address: populated.shipping_address_id ? {
        street: populated.shipping_address_id.street,
        city: populated.shipping_address_id.city,
        state: populated.shipping_address_id.state,
        pincode: populated.shipping_address_id.pincode,
      } : undefined,
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error('COD payment update error:', error);
    res.status(400).json({
      message: error.message || 'Failed to update COD payment status'
    });
  }
};
