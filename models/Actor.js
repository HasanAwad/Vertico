const { Schema, model } = require("mongoose");

const ModelSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
	},
	{
		collection: "actors",
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

ModelSchema.virtual("movies", {
	ref: "Movie",
	localField: "_id",
	foreignField: "actors",
});

const Model = model("Actor", ModelSchema);
module.exports = Model;
