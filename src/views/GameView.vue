<script setup lang="ts">
import { nextTick, onMounted, reactive } from "vue"

import { getRandomNumberBetween } from "@/utils/random"

import GameGrid from "@/components/GameGrid.vue"

const data = reactive({
  rows: 3,
  columns: 3,
  solved: false,
  resetting: true,
  solution: [] as Array<number>[],
})

onMounted(() => {
  setTimeout(() => {
    generateGame()
  }, 500)
})

function onTransitionFinished() {
  generateGame()
}

async function generateGame() {
  data.solution = []

  await nextTick(() => {
    data.rows = getRandomNumberBetween(4, 8)
    data.columns = getRandomNumberBetween(4, 8)

    for (let i = 0; i < data.rows; i++) {
      data.solution.push([])
      for (let j = 0; j < data.columns; j++) {
        data.solution[i].push(getRandomNumberBetween(0, 1))
      }
    }

    data.solved = false
    data.resetting = false
  })
}
</script>

<template>
  <Transition @after-leave="onTransitionFinished">
    <main v-show="!data.resetting">
      <div class="flex mb-4 justify-between">
        <p class="font-semibold">9gram</p>
        <button
          class="px-2 transition-colors"
          :class="{
            'bg-blue-700 text-white': data.solved,
            border: !data.solved,
          }"
          @click="data.resetting = true"
        >
          new
        </button>
      </div>

      <div class="border">
        <game-grid
          :solution="data.solution"
          :solved="data.solved"
          @solved="data.solved = true"
        />
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
