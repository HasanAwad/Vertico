const { Schema, model } = require("mongoose");

const ModelSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
		videourl: {
			type: String,
		},
		videoframe: {
			type: String,
		},
		cardimage: {
			type: String,
		},
		fullimage: {
			type: String,
		},
		description: { type: String, required: true },
		date: { type: String, required: true },

		ratings: { type: String, required: true },
		duration: { type: String, required: true },
		published: {
			type: Boolean,
			default: false,
		},
		actors: [
			{
				type: Schema.Types.ObjectId,
				ref: "Actor",
			},
		],
		genres: [
			{
				type: Schema.Types.ObjectId,
				ref: "Genre",
			},
		],
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: "movies",
		timestamps: true,
	}
);

ModelSchema.pre(["find", "findOne"], function () {
	this.populate(["actors", "genres"]);
});

const Model = model("Movie", ModelSchema);
module.exports = Model;
