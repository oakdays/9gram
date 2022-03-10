<script setup lang="ts">
import { computed, nextTick, reactive, watch } from "vue"

import { Action, ActionEffect, CellState, MouseButton } from "@/utils/enums"

import GridCell from "@/components/GridCell.vue"

const props = defineProps<{
  solution: Array<number>[]
  solved: boolean
}>()

const emit = defineEmits(["solved"])

const data = reactive({
  matrix: [] as Array<Array<number>>,
  actionBeingDone: Action.None,
  actionEffect: ActionEffect.None,
})

watch(
  () => data.matrix,
  (newValue) => {
    nextTick(() => {
      let isEqual = true

      for (let i in newValue) {
        for (let j in newValue[i]) {
          if (
            (newValue[i][j] === 1 && newValue[i][j] !== props.solution[i][j]) ||
            (newValue[i][j] !== 1 && props.solution[i][j] === 1)
          ) {
            isEqual = false
            break
          }
        }
        if (!isEqual) break
      }

      if (isEqual) emit("solved")
    })
  },
  { deep: true }
)

watch(
  () => props.solved,
  (newValue) => {
    nextTick(() => {
      if (newValue) {
        for (let i in data.matrix) {
          for (let j in data.matrix[i]) {
            if (data.matrix[i][j] === 2) {
              data.matrix[i][j] = 0
            }
          }
        }
      }
    })
  }
)

watch(
  () => props.solution,
  () => {
    data.matrix = []

    nextTick(() => {
      for (let i = 0; i < props.solution.length; i++) {
        data.matrix.push([])
        for (let j = 0; j < props.solution[i].length; j++) {
          data.matrix[i].push(0)
        }
      }
    })
  }
)

function removeZeros(hints: Array<number>[]) {
  hints.forEach((hintGroup, index) => {
    hints[index] = hintGroup.filter((hint) => hint > 0)
  })
  return hints
}

const rowHints = computed(() => {
  let hints: Array<number>[] = []

  for (let i in props.solution) {
    hints.push([])
    for (let j in props.solution[i]) {
      if (props.solution[i][j] == 1) {
        if (hints[i].length == 0) hints[i].push(1)
        else hints[i][hints[i].length - 1]++
      } else {
        if (hints[i].length > 0) hints[i].push(0)
      }
    }
  }

  return removeZeros(hints)
})

const columnHints = computed(() => {
  let hints: Array<number>[] = []

  for (let i in props.solution) {
    for (let j in props.solution[i]) {
      if (!hints[j]) hints[j] = [props.solution[i][j]]
      else {
        if (props.solution[i][j] == 1) hints[j][hints[j].length - 1]++
        else hints[j].push(props.solution[i][j])
      }
    }
  }

  return removeZeros(hints)
})

const maximumRowHintWidth = computed(() => {
  let maxWidth = 0

  rowHints.value.forEach((hints) => {
    maxWidth = Math.max(maxWidth, hints.length)
  })

  return `${maxWidth * 25}px`
})

function getRowHint(index: number) {
  return rowHints.value[index] && rowHints.value[index].length
    ? rowHints.value[index].join(" ")
    : 0
}

function handleMouseDown(state: CellState, mouseButton: MouseButton) {
  switch (state) {
    case CellState.Empty:
      if (mouseButton === MouseButton.Left) {
        data.actionBeingDone = Action.Insert
      } else if (mouseButton === MouseButton.Right) {
        data.actionBeingDone = Action.Mark
      }

      data.actionEffect = ActionEffect.Inserting
      break

    case CellState.Active:
      if (mouseButton === MouseButton.Left) {
        data.actionBeingDone = Action.Insert
        data.actionEffect = ActionEffect.Removing
      } else if (mouseButton === MouseButton.Right) {
        data.actionBeingDone = Action.Mark
        data.actionEffect = ActionEffect.Inserting
      }

      break

    case CellState.Marked:
      if (mouseButton === MouseButton.Left) {
        data.actionBeingDone = Action.Insert
        data.actionEffect = ActionEffect.Inserting
      } else if (mouseButton === MouseButton.Right) {
        data.actionBeingDone = Action.Mark
        data.actionEffect = ActionEffect.Removing
      }

      break
  }
}

function handleMouseUp() {
  data.actionBeingDone = Action.None
  data.actionEffect = ActionEffect.None
}
</script>

<template>
  <Transition>
    <div class="border-bottom flex">
      <div
        class="flex flex-col justify-center border"
        :class="{ 'border-l-0 border-t-0': solved }"
        :style="{ width: maximumRowHintWidth, minWidth: '40px' }"
      />

      <div
        v-for="(hints, index) in columnHints"
        :key="index"
        class="flex flex-col justify-end w-7 border text-center"
        :class="{
          'border-t-0': solved,
          'border-r-0': index === columnHints.length - 1 && solved,
        }"
      >
        <template v-if="hints.length">
          <div
            v-for="(hint, hintIndex) in hints"
            :key="hintIndex"
            :class="{ 'pt-5': hintIndex === 0 }"
          >
            {{ hint }}
          </div>
        </template>
        <template v-else> 0 </template>
      </div>
    </div>
  </Transition>

  <div class="flex" v-for="(row, rowIndex) in data.matrix" :key="rowIndex">
    <Transition>
      <div
        class="flex items-center justify-end border pr-2"
        :class="{
          'border-l-0': solved,
          'border-b-0': rowIndex === data.matrix.length - 1 && solved,
        }"
        :style="{ width: maximumRowHintWidth, minWidth: '40px' }"
      >
        <p>
          {{ getRowHint(rowIndex) }}
        </p>
      </div>
    </Transition>

    <grid-cell
      v-for="(value, index) in row"
      :key="index"
      :action-being-done="data.actionBeingDone"
      :action-effect="data.actionEffect"
      :disabled="solved"
      v-model:value="row[index]"
      :class="{
        'border-t': rowIndex === 0 && solved,
        'border-l': index === 0 && solved,
      }"
      @mouse-down="handleMouseDown"
      @mouse-up="handleMouseUp"
    />
  </div>
</template>
