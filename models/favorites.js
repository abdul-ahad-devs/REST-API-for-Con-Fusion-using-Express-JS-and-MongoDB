const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let favoriteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish"
    }
  ]
});

let Favorites = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorites;