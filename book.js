
const responsiveWarning = document.getElementById("responsive-warning");
// "true" if the site is optimized for responsive design, "false" if not.
const responsiveDesign = false;
const introOverlayKey = "webstoof-book-intro-seen";

function showBookIntro() {
	if (localStorage.getItem(introOverlayKey) === "true") {
		return;
	}

	const overlay = document.createElement("div");
	overlay.className = "book-intro-overlay";
	overlay.setAttribute("role", "dialog");
	overlay.setAttribute("aria-modal", "true");
	overlay.setAttribute("aria-labelledby", "book-intro-title");
	overlay.innerHTML = `
		<div class="book-intro-panel">
			<button class="book-intro-close" type="button" aria-label="Close">&times;</button>
			<p class="book-intro-kicker">A quick guide</p>
			<h2 id="book-intro-title">Explore the book</h2>
			<div class="book-intro-boxes">
				<div class="book-intro-box">
					<strong>Open a page</strong>
					<span>Click the cover or a page edge to turn the page.</span>
				</div>
				<div class="book-intro-box">
					<strong>Move between books</strong>
					<span>Use the arrows to go back home or visit the next book.</span>
				</div>
				<div class="book-intro-box">
					<strong>Take your time</strong>
					<span>Each book is interactive, so click through to discover more!</span>
				</div>
			</div>
			<button class="book-intro-start" type="button">Start exploring</button>
		</div>
	`;

	document.body.appendChild(overlay);
	document.body.classList.add("book-intro-open");

	const closeOverlay = () => {
		localStorage.setItem(introOverlayKey, "true");
		document.body.classList.remove("book-intro-open");
		overlay.remove();
		document.removeEventListener("keydown", handleKeydown);
	};
	const handleKeydown = (event) => {
		if (event.key === "Escape") {
			closeOverlay();
		}
	};

	overlay.querySelector(".book-intro-close").addEventListener("click", closeOverlay);
	overlay.querySelector(".book-intro-start").addEventListener("click", closeOverlay);
	overlay.addEventListener("click", (event) => {
		if (event.target === overlay) {
			closeOverlay();
		}
	});
	document.addEventListener("keydown", handleKeydown);
	overlay.querySelector(".book-intro-start").focus();
}

try {
	showBookIntro();
} catch (error) {
	// Ignore storage restrictions so the flip book still works normally.
}

const mobileHomeButton = document.createElement('a');
mobileHomeButton.href = './index.html';
mobileHomeButton.className = 'mobile-home-button';
mobileHomeButton.setAttribute('aria-label', 'Back to home');
mobileHomeButton.title = 'Home';
mobileHomeButton.innerHTML = '<img src="./icons/43cf9355-8cf6-4df6-84a2-235e9ccec9c6.png" alt="Home" />';

const enableMobilePortraitMode = () => {
	if (window.matchMedia('(max-width: 768px) and (orientation: portrait)').matches) {
		if (!document.body.contains(mobileHomeButton)) {
			document.body.appendChild(mobileHomeButton);
		}
		return true;
	}

	if (document.body.contains(mobileHomeButton)) {
		mobileHomeButton.remove();
	}
	return false;
};

const mobilePageReader = () => {
	if (!enableMobilePortraitMode()) {
		return;
	}

	const nextBookMap = [
		'./about-me.html',
		'./games-creation.html',
		'./digital-art.html',
		'./3d-modelling.html',
		'./traditional-art.html',
		'./graphic-design.html'
	];

	const getNextBookPath = () => {
		const currentPageName = window.location.pathname.split('/').pop() || '';
		const currentIndex = nextBookMap.findIndex((bookPath) => bookPath.endsWith(currentPageName));
		const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % nextBookMap.length : 0;
		return nextBookMap[nextIndex];
	};

	const books = [document.getElementById('flip_book'), document.getElementById('flip_book1')].filter(Boolean);
	books.forEach((book) => {
		const pages = [...book.querySelectorAll('.page')];
		if (!pages.length) return;

		book.classList.add('mobile-reader');
		let currentPage = 0;
		let showBack = false;
		let isAnimating = false;

		const render = () => {
			pages.forEach((page, index) => {
				const active = index === currentPage;
				page.classList.toggle('active', active);
				page.style.display = active ? 'block' : 'none';
				page.style.visibility = active ? 'visible' : 'hidden';
				page.style.transform = active ? 'translateX(0) scale(1)' : 'translateX(18px) scale(0.98)';
				page.style.pointerEvents = active ? 'auto' : 'none';

				const front = page.querySelector('.front_content');
				const back = page.querySelector('.back_content');
				if (front) front.style.display = active && !showBack ? 'block' : 'none';
				if (back) back.style.display = active && showBack ? 'block' : 'none';
			});
		};

		book.querySelectorAll('.front_cover').forEach((cover) => {
			cover.style.display = 'none';
		});
		document.querySelectorAll('.arrow').forEach((arrow) => {
			arrow.style.display = 'none';
		});

		book.addEventListener('click', (event) => {
			if (isAnimating) return;
			const rect = book.getBoundingClientRect();
			const clickX = event.clientX - rect.left;
			const isLeftSide = clickX < rect.width / 2;
			isAnimating = true;

			if (isLeftSide) {
				if (showBack) {
					showBack = false;
				} else if (currentPage > 0) {
					currentPage -= 1;
					showBack = true;
				}
				render();
				window.setTimeout(() => {
					isAnimating = false;
				}, 420);
				return;
			}

			if (showBack) {
				if (currentPage < pages.length - 1) {
					currentPage += 1;
					showBack = false;
				} else {
					book.style.transform = 'translateX(-10px)';
					window.setTimeout(() => {
						window.location.href = getNextBookPath();
					}, 220);
					return;
				}
			} else if (pages[currentPage].querySelector('.back_content')) {
				showBack = true;
			} else if (currentPage < pages.length - 1) {
				currentPage += 1;
				showBack = false;
			} else {
				book.style.transform = 'translateX(-10px)';
				window.setTimeout(() => {
					window.location.href = getNextBookPath();
				}, 220);
				return;
			}

			render();
			window.setTimeout(() => {
				isAnimating = false;
			}, 420);
		});

		render();
	});
};

mobilePageReader();
window.addEventListener('resize', () => {
	mobilePageReader();
});
window.addEventListener('orientationchange', () => {
	mobilePageReader();
});
// Show mobile warning if the user is on mobile and responsive-design is false.
// if (!responsiveDesign && window.innerWidth <= 768) {
// 	responsiveWarning.classList.add("show");
// }

// window.requestAnimFrame = (function () {
// 		return  window.requestAnimationFrame ||
// 			window.webkitRequestAnimationFrame ||
// 			window.mozRequestAnimationFrame ||
// 			window.oRequestAnimationFrame ||
// 			window.msRequestAnimationFrame ||
// 			function (callback) {
// 				window.setTimeout(callback, 1000 / 60);
// 			};
// 	})();

// 	Math.randMinMax = function(min, max, round) {
// 		var val = min + (Math.random() * (max - min));
		
// 		if( round ) val = Math.round( val );
		
// 		return val;
// 	};
// 	Math.TO_RAD = Math.PI/180;
// 	Math.getAngle = function( x1, y1, x2, y2 ) {
		
// 		var	dx = x1 - x2,
// 			dy = y1 - y2;
		
// 		return Math.atan2(dy,dx);
// 	};
// 	Math.getDistance = function( x1, y1, x2, y2 ) {
		
// 		var 	xs = x2 - x1,
// 			ys = y2 - y1;		
		
// 		xs *= xs;
// 		ys *= ys;
		 
// 		return Math.sqrt( xs + ys );
// 	};

// 	var 	FX = {};

// 	(function() {
		
// 		var	canvas = document.getElementById('myCanvas'),
// 			ctx = canvas.getContext('2d'),
// 			lastUpdate = new Date(),
// 			mouseUpdate = new Date(),
// 			lastMouse = [],
// 			width, height;

// 		FX.particles = [];

// 		setFullscreen();
// 		document.getElementById('button').addEventListener('mousedown', buttonEffect);

// 		function buttonEffect() {

// 			var button = document.getElementById('button'),
// 				height = button.offsetHeight,
// 				left = button.offsetLeft,
// 				top = button.offsetTop,
// 				width = button.offsetWidth,
// 				x, y, degree;

// 			for(var i=0;i<40;i=i+1) {

// 				if( Math.random() < 0.5 ) {

// 					y = Math.randMinMax(top, top+height);

// 					if( Math.random() < 0.5 ) {
// 						x = left;
// 						degree = Math.randMinMax(-45,45);
// 					} else {
// 						x = left + width;
// 						degree = Math.randMinMax(135,225);
// 					}
          
// 				} else {

// 					x = Math.randMinMax(left, left+width);

// 					if( Math.random() < 0.5 ) {
// 						y = top;
// 						degree = Math.randMinMax(45,135);
// 					} else {
// 						y = top + height;
// 						degree = Math.randMinMax(-135, -45);
// 					}
					
// 				}
// 				createParticle({
// 					x: x,
// 					y: y,
// 					degree: degree,
// 					speed: Math.randMinMax(100, 150),
// 					vs: Math.randMinMax(-4,-1)
// 				});
// 			}
// 		}
// 		window.setTimeout(buttonEffect, 100); 

// 		loop();


// 		function createParticle( args ) {

// 			var options = {
// 				x: width/2,
// 				y: height/2,
// 				color: 'hsla('+ Math.randMinMax(160, 290) +', 100%, 50%, '+(Math.random().toFixed(2))+')',
// 				degree: Math.randMinMax(0, 360),
// 				speed: Math.randMinMax(300, 350),
// 				vd: Math.randMinMax(-90,90),
// 				vs: Math.randMinMax(-8,-5)
// 			};

// 			for (key in args) {
// 			  options[key] = args[key];
// 			}

// 			FX.particles.push( options );
// 		}

// 		function loop() {

// 			var 	thisUpdate = new Date(),
// 				delta = (lastUpdate - thisUpdate) / 1000,
// 				amount = FX.particles.length,
// 				size = 2,
// 				i = 0,
// 				p;

			
// 			ctx.fillRect(0,0,width,height);

// 			ctx.globalCompositeStyle = 'lighter';

// 			for(;i<amount;i=i+1) {

// 				p = FX.particles[ i ];

// 				p.degree += (p.vd * delta);
// 				p.speed += (p.vs);// * delta);
// 				if( p.speed < 0 ) continue;

// 				p.x += Math.cos(p.degree * Math.TO_RAD) * (p.speed * delta);
// 				p.y += Math.sin(p.degree * Math.TO_RAD) * (p.speed * delta);

// 				ctx.save();
			
// 				ctx.translate( p.x, p.y );
// 				ctx.rotate( p.degree * Math.TO_RAD );

// 				ctx.fillStyle = p.color;
// 				ctx.fillRect( -size, -size, size*2, size*2 );

// 				ctx.restore();
// 			}

// 			lastUpdate = thisUpdate;

// 			requestAnimFrame( loop );
// 		}

		
// 	})();



