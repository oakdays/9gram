<script setup lang="ts">
import { nextTick, reactive, ref, watch } from "vue"

import { Action, ActionEffect, CellState, MouseButton } from "@/utils/enums"

const props = defineProps<{
  disabled: boolean
  value: number
  actionBeingDone: Action
  actionEffect: ActionEffect
}>()

const emit = defineEmits(["update:value", "mouseDown", "mouseUp"])

const data = reactive({
  state: ref<CellState>(CellState.Empty),
})

watch(
  () => props.value,
  (newValue) => {
    data.state = newValue
  }
)

watch(
  () => data.state,
  (newState) => {
    nextTick(() => {
      emit("update:value", newState)
    })
  }
)

function onMouseDown(mouseButton?: MouseButton) {
  if (!props.disabled) {
    // left click
    if (mouseButton === MouseButton.Left) {
      emit("mouseDown", data.state, MouseButton.Left)
      data.state =
        data.state !== CellState.Active ? CellState.Active : CellState.Empty
    }

    // right click
    else if (mouseButton === MouseButton.Right) {
      emit("mouseDown", data.state, MouseButton.Right)
      data.state =
        data.state !== CellState.Marked ? CellState.Marked : CellState.Empty
    }
  }
}

function onMouseUp() {
  emit("mouseUp")
}

function onMouseOver() {
  switch (props.actionBeingDone) {
    case Action.None:
      break

    case Action.Insert:
      if (
        props.actionEffect === ActionEffect.Inserting &&
        data.state === CellState.Empty
      ) {
        data.state = CellState.Active
      } else if (props.actionEffect === ActionEffect.Removing) {
        data.state = CellState.Empty
      }

      break

    case Action.Mark:
      if (
        props.actionEffect === ActionEffect.Inserting &&
        data.state === CellState.Empty
      ) {
        data.state = CellState.Marked
      } else if (props.actionEffect === ActionEffect.Removing) {
        data.state = CellState.Empty
      }

      break
  }
}
</script>

<template>
  <div
    class="w-7 h-7 border transition"
    :class="{
      'cursor-pointer': !disabled,
      'bg-white': data.state === CellState.Empty,
      'bg-black': data.state === CellState.Active,
      'bg-gray-400': data.state === CellState.Marked,
      'border-0': disabled,
    }"
    @click.right.prevent
    @mousedown="onMouseDown($event.button)"
    @mouseup="onMouseUp"
    @mouseover="onMouseOver"
  />
</template>
