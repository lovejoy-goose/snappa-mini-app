import SpringTransition from "../components/effects/SpringTransition";

const Palomino = () => {
	return (
		<div className="flex flex-col text-center gap-4">
			<SpringTransition isActive={true}>
				<div className="absolute top-10 w-full h-full flex justify-center">
					<span className="text-lg font-bold">If I Had A Boat</span>
				</div>

				<article className="prose dark:prose-invert text-left py-4 px-8 text-sm">
					If I were Roy Rogers
					<br />
					I'd sure enough be single
					<br />I couldn't bring myself to marrying old Dale
					<br />
					Well, it'd just be me and Trigger
					<br />
					We'd go riding through them movies
					<br />
					Then we'd buy a boat and on the sea we'd sail
					<br />
					<br />
					And if I had a boat I'd go out on the ocean
					<br />
					And if I had a pony I'd ride him on my boat
					<br />
					And we could all together Go out on the ocean
					<br />I said me upon my pony on my boat
					<br />
					<br />
					The mystery masked man was smart
					<br />
					He got himself a Tonto
					<br />
					'Cause Tonto did the dirty work for free
					<br />
					But Tonto he was smarter
					<br />
					And one day said kemo sabe
					<br />
					<h3>
						Well, kiss my ass, I bought a boat
						<br />
						I'm going out to sea
					</h3>
				</article>

				<div className="text-xs">
					song, lyrics by <span class="italic">Lyle Lovett</span>.
				</div>
				<div className="flex flex-col gap-4 items-center">
					<img
						src="https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/a78ae8ba-add7-4d96-f54f-3e1138312d00/rectcontain3"
						alt="Samuel L Huber"
						className="w-1/2"
					/>
				</div>
			</SpringTransition>
		</div>
	);
};

export default Palomino;
