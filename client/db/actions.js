import { connectToDatabase } from "./dbConfig";

import User from "./schema/user.schema";
// import Chat from "./schema/chat";
// import Seller from "./schema/seller.schema"; // Removed - now using unified User schema
import Product from "./schema/product.schema";
import Review from "./schema/review.schema";
import Order from "./schema/order.schema";
import { addToCart } from "@/app/store/functions";

export const db = {
  addUser: async (data) => {
    try {
      await connectToDatabase();
      const result = await User.create(data);
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  addSeller: async (data) => {
    try {
      await connectToDatabase();
      // Use unified User schema with role: "seller"
      const sellerData = {
        ...data,
        role: "seller"
      };
      const result = await User.create(sellerData);
      return result;
    } catch (error) {
      throw error;
    }
  },

  sendChat: async (data) => {
    try {
      await connectToDatabase();
      const result = await Chat.create(data);
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  // add product
  addProduct: async (data) => {
    try {
      await connectToDatabase();
      const result = await Product.create(data);
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  getProducts: async () => {
    try {
      await connectToDatabase();
      const result = await Product.find({}).populate("owner");
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  addToCart: async (userId, productId) => {
    try {
      await connectToDatabase();
      // update user's cart with new product
      const result = await User.updateOne(
        {
          _id: userId,
        },
        {
          $addToSet: {
            cart: productId,
          },
        }
      );
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  getCart: async (userId) => {
    try {
      await connectToDatabase();
      const result = await User.findOne({ _id: userId }).populate("cart");
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  getCartSize: async (userId) => {
    try {
      if (!userId) {
        console.log("No userId provided to getCartSize");
        return 0;
      }
      
      await connectToDatabase();
      const user = await User.findOne({ _id: userId }).select("cart");
      
      if (!user || !user.cart) {
        console.log("User or user's cart not found");
        return 0;
      }
      
      return user.cart.length || 0;
    } catch (error) {
      console.error("Error in getCartSize:", error.message);
      return 0; // Return 0 instead of throwing an error
    }
  },

  emptyCart: async (userId) => {
    try {
      await connectToDatabase();
      const result = await User.updateOne(
        {
          _id: userId,
        },
        {
          $set: {
            cart: [],
          },
        }
      );
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  getOrders: async (userId) => {
    try {
      await connectToDatabase();
      const user = await User.findOne({ _id: userId });
      const result = await Order.find({ _id: { $in: user.productsBought } });
      // from this orders, add product's name and description from items productid
      const orders = [];
      // console.log("result:", result);
      for (const order of result) {
        for (const item of order.items) {
          const product = await Product.findOne({ _id: item.productId });
          if (!product) continue;
          orders.push({
            ...order._doc,
            productName: product.name,
            productDescription: product.description,
            priceAtPurchase: item.priceAtPurchase,
            productImage: product.images[0],
          });
        }
      }
      console.log("orders:", orders);
      // new User({...}) + save = create
      return orders;
    } catch (error) {
      throw error;
    }
  },

  addOrder: async (data) => {
    const userId = data.userId;
    const items = data.items;
    console.log("items:", items);
    try {
      await connectToDatabase();
      const orderIds = await Promise.all(
        items.map(async (item) => {
          const order = await Order.create(item);
          return order._id;
        })
      );
      console.log("orderIds:", orderIds);
      const result = await User.updateOne(
        {
          _id: userId,
        },
        {
          $push: {
            productsBought: { $each: orderIds },
          },
        }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  addCartOrder: async (data) => {
    try {
      await connectToDatabase();
      const orderResult = await Order.create(data);
      const result = await User.updateOne(
        {
          _id: data.userId,
        },
        {
          $push: {
            productsBought: orderResult._id,
          },
        }
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getRecommendedProducts: async ({ name, description, category, tags }) => {
    try {
      await connectToDatabase();

      const queryConditions = [];

      if (name) {
        queryConditions.push({ name: new RegExp(name, "i") });
      }

      if (description) {
        queryConditions.push({ description: new RegExp(description, "i") });
      }

      if (category) {
        queryConditions.push({ category: new RegExp(category, "i") });
      }

      if (tags && tags.length > 0) {
        const tagArray = Array.isArray(tags)
          ? tags
          : tags.split(",").map((tag) => tag.trim());

        queryConditions.push({
          tags: { $in: tagArray.map((tag) => new RegExp(tag, "i")) },
        });
      }

      console.log("queryConditions:", queryConditions);

      const products = await Product.find({
        $or: queryConditions,
      }).populate("owner");

      return products;
    } catch (error) {
      throw error;
    }
  },

  getReviews: async (productId) => {
    try {
      await connectToDatabase();
      const result = await Review.find({ product: productId }).populate("user");
      // new User({...}) + save = create
      return result;
    } catch (error) {
      throw error;
    }
  },

  addReview: async (data) => {
    try {
      await connectToDatabase();
      const result = await Review.create(data);
      // new User({...}) + save = create
      return result;
    } catch (error) {
      return error;
    }
  },
};
