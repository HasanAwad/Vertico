// const Model = require("../models/book");
// const puppeteer = require("puppeteer-extra");
// const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
// const adblocker = AdblockerPlugin({
// 	blockTrackers: true,
// });
// puppeteer.use(adblocker);
const Actor = require("../models/Actor");
const Movie = require("../models/Movie");
const Genre = require("../models/Genre");

const puppeteer = require("puppeteer");

class Controller {
	getRelatedMovies(req, res, next) {
		(async () => {
			let { movie } = req.params;
			let thismovie = await Movie.findOne({ _id: movie });
			let related = [];
			let gen = thismovie.genres.length >= 2 ? 5 : 10;
			for (let i = 0; i < thismovie.genres.length; i++) {
				if (i == 2) {
					break;
				}

				let gen1 = await Movie.find({
					title: { $not: { $regex: thismovie.title, $options: "i" } },
					genres: { $elemMatch: { $eq: thismovie.genres[i] } },
				}).limit(gen);
				Array.prototype.push.apply(related, gen1);
			}
			if (thismovie.actors.length > 0) {
				let actor = await Movie.find({
					title: { $not: { $regex: thismovie.title, $options: "i" } },
					actors: { $elemMatch: { $eq: thismovie.actors[0] } },
				}).limit(5);

				Array.prototype.push.apply(related, actor);
			}
			res.json({ size: related.length, status: true, movies: related });
		})();
	}
	search(req, res, next) {
		(async () => {
			let { search, page } = req.params;
			const maxPerPage = 20;
			let count = await Movie.find({
				title: { $regex: search, $options: "i" },
			});
			let movies = await Movie.find({
				title: { $regex: search, $options: "i" },
			})
				.skip(maxPerPage * (page - 1))
				.limit(maxPerPage);

			res.json({
				last_page: Math.ceil(count.length / maxPerPage),
				status: true,
				movies,
			});
		})();
	}
	getMovie(req, res, next) {
		(async () => {
			let { movie } = req.params;

			let movieres = await Movie.findOne({ _id: movie });

			res.json({
				movie: movieres,
				status: true,
			});
		})();
	}
	getMovies(req, res, next) {
		(async () => {
			let { page } = req.params;
			const maxPerPage = 20;
			let count = await Movie.find();
			let movies = await Movie.find()
				.skip(maxPerPage * (page - 1))
				.limit(maxPerPage);

			res.json({
				last_page: Math.ceil(count.length / maxPerPage),
				status: true,
				movies,
			});
		})();
	}
	getMoviesByGenre(req, res, next) {
		(async () => {
			let { genre, page } = req.params;
			let gen = await Genre.findOne({
				name: { $regex: "^" + genre + "$", $options: "i" },
			});
			if (gen) {
				const maxPerPage = 20;
				let count = await Movie.find({
					genres: { $elemMatch: { $eq: gen._id } },
				});
				let movies = await Movie.find({
					genres: { $elemMatch: { $eq: gen._id } },
				})
					.skip(maxPerPage * (page - 1))
					.limit(maxPerPage);

				res.json({
					last_page: Math.ceil(count.length / maxPerPage),
					status: true,
					movies,
				});
			} else {
				res.json({
					last_page: 0,
					status: true,
					movies: [],
				});
			}
		})();
	}
	getMoviesByActor(req, res, next) {
		(async () => {
			let { actor, page } = req.params;
			let act = await Actor.findOne({ name: { $regex: actor, $options: "i" } });
			if (act) {
				const maxPerPage = 20;
				let count = await Movie.find({
					actors: { $elemMatch: { $eq: act._id } },
				});
				let movies = await Movie.find({
					actors: { $elemMatch: { $eq: act._id } },
				})
					.skip(maxPerPage * (page - 1))
					.limit(maxPerPage);

				res.json({
					last_page: Math.ceil(count.length / maxPerPage),
					status: true,
					movies,
				});
			} else {
				res.json({
					last_page: 0,
					status: true,
					movies: [],
				});
			}
		})();
	}
	pupp(req, res, next) {
		(async () => {
			res.json({ status: "true" });
		})();
	}
	fetch(req, res, next) {
		(async () => {
			let { pag, year } = req.params;
			const fetch = await import("node-fetch");

			let browser = await puppeteer.launch({
				args: ["--no-sandbox"],
			});
			let page = await browser.newPage();
			const url = `https://moviesjoy.to/filter?type=movie&quality=all&release_year=${year}&genre=all&country=all&page=${pag}`;

			await page.goto(url);
			let titles = await page.evaluate(() =>
				Array.from(document.querySelectorAll(".film-poster a"))
					.map((partner) => {
						if (partner.href.includes("moviesjoy.to/movie"))
							return {
								link:
									partner.href.slice(0, 20) +
									"/watch-movie" +
									partner.href.slice(26),
								title: partner.title,
							};
					})
					.filter((tit) => tit != null)
			);
			let infos = [];
			let shouldhave = 0;
			for (let i = 0; i < titles.length; i++) {
				let inf = { url: "", post_thumbnail: "", full: "" };
				try {
					let req1 = await fetch.default(
						"https://shahed4u.dev/wp-json/wp/v2/posts?search=" + titles[i].title
					);
					let res1 = await req1.json();
					if (res1.length > 0) {
						let test = await Movie.findOne({ title: titles[i].title });
						if (test) {
							continue;
						}
						console.log(titles[i].title);
						shouldhave++;
						try {
							await page.goto(res1[0].link + "watch", {
								waitUntil: "domcontentloaded",
								timeout: 5000,
							});
						} catch (e) {
							console.log("here");
							await page.reload(res1[0].link + "watch", {
								waitUntil: "networkidle0",
							});
						}

						let link = await page.evaluate(() => {
							return document.querySelector(".stream-player").childNodes[3].src;
						});
						inf.url = link;
						req1 = await fetch.default(
							"https://shahed4u.dev/wp-json/wp/v2/media/" +
								res1[0].featured_media
						);
						res1 = await req1.json();
						if (res1) {
							inf.full = res1.media_details.sizes.full.source_url;
						}

						try {
							await page.goto(titles[i].link, {
								waitUntil: "domcontentloaded",
								timeout: 5000,
							});
						} catch (e) {
							console.log("here2");
							await page.reload(titles[i].link, {
								waitUntil: "networkidle",
								timeout: 8000,
							});
						}

						let info = await page.evaluate(() => {
							return {
								name: document
									.querySelector(".heading-name a")
									.textContent.trim(),
								description: document
									.querySelector(".description")
									.textContent.trim(),
								IMDB: document
									.querySelector(".btn-imdb")
									.innerHTML.trim()
									.slice(5)
									.trim(),
								date: document
									.querySelectorAll(".row-line")[0]
									.innerText.slice(10)
									.trim(),
								post_thumbnail: document.querySelector(".film-poster-img").src,
								duration: document
									.querySelectorAll(".row-line")[3]
									.innerText.slice(9)
									.trim(),
								genre: document
									.querySelectorAll(".row-line")[1]
									.innerText.slice(6)
									.trim(),
								actors: document
									.querySelectorAll(".row-line")[2]
									.innerText.slice(7)
									.trim(),
							};
						});
						info.url = inf.url;
						info.full = inf.full;
						let ids2 = [];

						let genres = [];
						if (info.genre) {
							genres = info.genre.split(",");
							for (let i = 0; i < genres.length; i++) {
								if (!genres[i].trim()) {
									continue;
								}
								let gen = await Genre.findOne({ name: genres[i].trim() });
								if (!gen) {
									gen = new Genre({ name: genres[i].trim() });
									await gen.save();
								}

								ids2.push(gen._id);
							}
						}
						let ids = [];
						let actors = [];
						if (info.actors) {
							actors = info.actors.split(",");
							console.log(actors);
							for (let i = 0; i < actors.length; i++) {
								if (!actors[i].trim()) {
									continue;
								}
								let actor = await Actor.findOne({ name: actors[i].trim() });
								if (!actor) {
									actor = new Actor({ name: actors[i].trim() });
									await actor.save();
								}
								ids.push(actor._id);
							}
						}

						try {
							let movie = new Movie({
								title: info.name,
								slug: info.name,
								videourl: info.url,
								videoframe: `<iframe
								src={${info.url}}
								frameborder="0"
								webkit-playsinline=""
								playsinline=""
								preload="auto"
								allow="accelerometer; encrypted-media; gyroscope; picture-in-picture "
								allowfullscreen=""
							/>`,
								cardimage: info.post_thumbnail,
								fullimage: info.full,
								description: info.description,
								date: info.date,
								ratings: info.IMDB,
								duration: info.duration.split(" ")[0],
								published: true,
								actors: ids,
								genres: ids2,
							});
							await movie.save();
						} catch (e) {
							console.log(e);
						}
						infos.push(info);
					}
				} catch (e) {
					console.log(e);
					// await browser.close();
					// let browser = await puppeteer.launch({ headless: false });
					// let page = await browser.newPage();
				}
			}

			await browser.close();
			res.json({
				sizetitle: titles.length,
				shouldhave,
				size: infos.length,
				info: infos,
			});
		})();
	}
}

const controller = new Controller();
module.exports = controller;
