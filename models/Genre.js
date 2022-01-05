const { Schema, model } = require("mongoose");

const ModelSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
	},
	{
		collection: "genres",
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

ModelSchema.virtual("movies", {
	ref: "Movie",
	localField: "_id",
	foreignField: "genres",
});

const Model = model("Genre", ModelSchema);
module.exports = Model;
