let disks = 6;
const colours = ["green", "yellow", "red"];
let isGameStarted = false;
let moves = 0;

window.onload = () => {
  insertDisks();
  document.getElementById("start-btn").addEventListener("click", start);
};

async function start() {
  if (isGameStarted) return;

  isGameStarted = true;
  await hanoi(disks, 1, 3);
}

async function hanoi(n, from, to) {
  const other = 6 - (from + to);

  if (n === 1) {
    await move(from, to);
    return 1;
  }

  const step1 = await hanoi(n - 1, from, other);
  const step2 = await hanoi(1, from, to);
  const step3 = await hanoi(n - 1, other, to);

  return step1 + step2 + step3;
}

function insertDisks() {
  const rod1 = document.getElementById("rod-1");

  let diskWidth = 30;
  let colourIndex = 0;

  for (let disk = 1; disk <= disks; ++disk) {
    colourIndex = colourIndex === 2 ? 0 : ++colourIndex;

    rod1.insertAdjacentHTML(
      "beforeend",
      `<div class="w-[${diskWidth}px] h-[15px] bg-${colours[colourIndex]}-500 rounded"></div>`
    );

    diskWidth += 20;
  }
}

async function move(from, to) {
  await sleep(200);

  const fromRod = document.getElementById(`rod-${from}`);
  const toRod = document.getElementById(`rod-${to}`);
  const disk = fromRod.firstElementChild;

  if (!disk) return;

  moves++;
  document.getElementById("moves").innerHTML = `Moves: ${moves}`;

  fromRod.removeChild(disk);
  toRod.prepend(disk);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
