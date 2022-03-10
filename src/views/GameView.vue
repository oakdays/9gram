<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, watch } from "vue"

import { getRandomNumberBetween } from "@/utils/random"

import GameGrid from "@/components/GameGrid.vue"

const minRows = 4
const minCols = 4

const maxRows = 4
const maxCols = 4

const data = reactive({
  rows: 0,
  columns: 0,
  solved: false,
  resetting: true,
  solution: [] as Array<number>[],
  startingTime: new Date().getTime(),
  timePassed: 0,
  timer: 0,
})

onMounted(() => {
  setTimeout(() => {
    generateGame()
  }, 500)
})

const formattedTimePassed = computed(() => {
  return (
    `${Math.floor(data.timePassed / 1000 / 60) < 10 ? "0" : ""}` +
    `${Math.floor(data.timePassed / 1000 / 60)}` +
    `:${(data.timePassed / 1000) % 60 < 10 ? "0" : ""}` +
    `${Math.floor((data.timePassed / 1000) % 60)}` +
    `${
      data.solved
        ? `:${data.timePassed % 1000 < 100 ? "0" : ""}${data.timePassed % 1000}`
        : ""
    }`
  )
})

watch(
  () => data.solved,
  (newValue) => {
    if (newValue) {
      clearInterval(data.timer)
    }
  }
)

function onTransitionFinished() {
  generateGame()
}

async function generateGame() {
  data.solution = []

  await nextTick(() => {
    data.rows = getRandomNumberBetween(minRows, maxRows)
    data.columns = getRandomNumberBetween(minCols, maxCols)

    for (let i = 0; i < data.rows; i++) {
      data.solution.push([])
      for (let j = 0; j < data.columns; j++) {
        data.solution[i].push(getRandomNumberBetween(0, 1))
      }
    }

    data.solved = false
    data.resetting = false

    data.startingTime = new Date().getTime()
    data.timePassed = 0
    data.timer = setInterval(() => {
      data.timePassed = new Date().getTime() - data.startingTime
    }, 1)
  })
}

function share() {
  let shareString = ""

  for (let i = 0; i < data.rows; i++) {
    for (let j = 0; j < data.columns; j++) {
      shareString += data.solution[i][j] === 1 ? "⬛" : "⬜"
    }
    shareString += "\n"
  }

  shareString = `${shareString}\n⏱ ${formattedTimePassed.value} \n🔗 9gram https://9gram.netlify.app/`

  updateClipboard(shareString)
}

async function updateClipboard(newClip: string) {
  await navigator.clipboard.writeText(newClip)
}
</script>

<template>
  <Transition @after-leave="onTransitionFinished">
    <main v-show="!data.resetting">
      <div class="flex mb-8 justify-between items-center">
        <p class="font-semibold text-xl">9gram</p>

        <button
          class="px-3 py-1 transition-colors"
          :class="{
            'bg-lime-700 text-white': data.solved,
            'border-2': !data.solved,
          }"
          @click="data.resetting = true"
        >
          new
        </button>
      </div>

      <div :class="{ border: !data.solved, 'border-2': data.solved }">
        <game-grid
          :solution="data.solution"
          :solved="data.solved"
          @solved="data.solved = true"
        />
      </div>

      <div class="flex justify-between mt-8 items-center">
        <time class="text-xl" :datetime="formattedTimePassed">{{
          formattedTimePassed
        }}</time>
        <button
          v-if="data.solved"
          class="px-2 py-1 transition-colors"
          :class="{
            'bg-[#1da1f2] text-white': data.solved,
            border: !data.solved,
          }"
          @click="share"
        >
          share
        </button>
      </div>
    </main>
  </Transition>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
