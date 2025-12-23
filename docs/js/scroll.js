const scrollContent = document.getElementById("scrollContent");
const scoreEl = document.getElementById("score");
const endOverlay = document.getElementById("endOverlay");
const continueBtn = document.getElementById("continueBtn");

let score = 0;
let position = 0;
let lastTime = performance.now();
let pixelsPerSecond = 14;
let targetSpeed = 14;
let started = false;
let ended = false;

/* Demo text (replace later with Firebase) */
const text = `
<p>Apples iStore are instantly recognizable. Its architecture are sleek, minimalist, and almost museum-like. The walls are wite, the tables are wooden, and the devices are displayed with presision. This design reflects Apple’s marketing strategy: simplicity, eligance, and exclusivity. The store itself is part of the brand’s storytelling, reinforcing the idea that Apple products are not just tools but lifestyle choices.</p>

    <p>Samsung’s flogship store, by contrast, is vibrant and interactive. Known as Samsung KX, it is designed less like a shop and more like a tecnology playground. Visitors can explore zones dedicated to virtual reality, smart kitchens, and even creative workshops. The atmosphere is energetic, colorful, and dynamic, reflecting Samsung’s marketing approach: technology as an everyday companion, accessible and versatile.</p>

    <p>Apple’s marketing rely heavily on emotional branding. There advertisements often show familys connecting, students creating, or professionals acheiving success. The message is subtle but powerful: owning Apple products makes life smoother, more creative, and more meaningful. This emotional appeal is reinforced in the store, where the environment feels calm and aspirational.</p>

    <p>Samsungs marketing, on the other hand, emphasizes practicality and variety. Their campaigns highlight how devices integrate into daily life—phones that connect to smart fridges, tablets that help with work, and TVs that transform living rooms. The flagship store mirrors this approach by offering demonstrations and workshops that show technology in action. The message is clear: Samsung wants to prove that its products are useful in every corner of life.</p>

    <p>Yet both approaches fice challenges. Apple’s iStore sometimes feels intimidating. The polished environment can make customers hesitant to ask questions, and the high prices reinforce the sense of exclusivity. Moreover, Apple’s constant cycle of new product releases encourages frequent upgrades, raising concerns about sustainability and electronic waste. Critics argue that this “upgrade culture” pressures consumers to replace devices unnecessarily.</p>

    <p>Samsung’s flagship store faces a different set of issues. Its size and variety can be overwhelming. With so many zones and activities, visitors may become distracted from the core products. Some people come for the workshops or café without engaging deeply with the devices. Additionally, Samsung’s flagship concept has struggled with consistency; while London’s store thrives, similar spaces in other cities have closed when sales slowed.</p>

    <p>Apple’s iStore attracts tourists from around the world. Many visitors come not only to shop but to experience the brand’s prestige. The store becomes a destination, a place to take photos and feel part of the Apple community. Samsung’s flagship store, in contrast, appeals more to locals who want to explore technology in a hands-on way. It is less about prestige and more about participation.</p>

    <p>The differences can be summarized as tone. Apple’s markting is like a whisper—calm, elegant, persuasive. Samsung’s marketing is like a shout—energetic, colorful, and full of action. Apple makes customers feel like they are joining an exclusive club. Samsung makes them feel like they are joining a community experiment. Both companies design their stores as more than retail spaces. Apple calls its stores “town squares,” places where people can gather, learn, and connect. Samsung calls its flagship store an “experience hub,” where technology feels alive and interactive. These metaphors reveal their philosophies: Apple focuses on identity and belonging, while Samsung focuses on engagement and exploration.</p>

    <p>The practical issues remain importants. Apple’s upgrade culture raises questions about environmental responsibility. Samsung’s flagship model raises questions about sustainability of the concept itself. Yet both continue to innovate in how they present technology to the public.</p>

    <p>Ultimitely, Apple wins in loyalty. Customers often line up overnight for new iPhones, driven by emotional connection to the brand. Samsung wins in engagement. Visitors spend hours exploring, experimenting, and learning, even if they don’t make a purchase.</p>

    <p>The story of Apple and Samsung in London is not about which company is better. It is about how two companies tell very different stories through their stores, and how those stories shape the way people experience technology. Apple’s iStore represents polished exclusivity and emotional branding. Samsung’s flagship store represents interactive accessibility and practical demonstrations. Together, they show two visions of the future: one sleek and aspirational, the other playful and inclusive.</p>

`;

const mistakes = ["flogship", "tecnology", "eligance", "presision", "rely", "familys", "acheiving", "flogship", "fridges", "variety", "fice", "upgrades", "ultimitely"];

/* Build content */
function initText(raw) {
  scrollContent.innerHTML = raw;
  scrollContent.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      if (mistakes.includes(span.innerText)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          targetSpeed += 5;
          scoreEl.textContent = `Score: ${score}`;
        }
      }
      // Do nothing for wrong clicks (no red marking)
    });
  });

  position = scrollContent.parentElement.clientHeight;
  scrollContent.style.top = position + "px";
  started = true;
}

initText(text);

/* Smooth scroll loop */
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (started && !ended) {
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.05;
    position -= pixelsPerSecond * delta;
    scrollContent.style.top = position + "px";

    const h = scrollContent.offsetHeight;
    if (position + h <= 0) {
      ended = true;
      endOverlay.classList.remove("hidden");
    }
  }

  requestAnimationFrame(scrollLoop);
}

requestAnimationFrame(scrollLoop);

/* Continue button */
continueBtn.addEventListener("click", () => {
  // TODO: change to next section when ready
  window.location.href = "#";
});
