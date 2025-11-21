// const main = document.querySelector('main');
// let isDown = false, startX, scrollLeft;

// main.addEventListener('mousedown', e => {
//     isDown = true;
//     startX = e.pageX;
//     scrollLeft = main.scrollLeft;
// });

// main.addEventListener('mouseup', () => isDown = false);
// main.addEventListener('mouseleave', () => isDown = false);

// main.addEventListener('mousemove', e => {
//     if (!isDown) return;
//     e.preventDefault();
//     main.scrollLeft += startX - e.pageX;
//     startX = e.pageX;
// });

let sections = document.querySelectorAll("section");
let scrollContainer = document.querySelector(".draggable");
let clamp, dragRatio;

let scrollTween = gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none"
});

let horizontalScroll = ScrollTrigger.create({
  animation: scrollTween,
  trigger: scrollContainer,
  pin: true,
  scrub: 1,
  end: () => "+=" + scrollContainer.offsetWidth,
});

var drag = Draggable.create(".proxy", {
  trigger: scrollContainer,
  type: "x",
  onPress() {
    clamp || ScrollTrigger.refresh();
    this.startScroll = horizontalScroll.scroll();
  },
  onDrag() {
    horizontalScroll.scroll(clamp(this.startScroll - (this.x - this.startX) * dragRatio));
    // if you don't want it to lag at all while dragging (due to the 1-second scrub), uncomment the next line:
    //horizontalScroll.getTween().progress(1);
  }
})[0];

ScrollTrigger.addEventListener("refresh", () => {
  clamp = gsap.utils.clamp(horizontalScroll.start + 1, horizontalScroll.end - 1); // don't let the drag-scroll hit the very start or end so that it doesn't unpin
  // total scroll amount divided by the total distance that the sections move gives us the ratio we can apply to the pointer movement so that it fits. 
  dragRatio = scrollContainer.offsetWidth / (window.innerWidth * (sections.length - 1));
});