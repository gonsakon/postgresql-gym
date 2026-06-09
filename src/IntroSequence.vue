<template>
  <div class="intro-overlay">
    <div class="intro-chapter">
      <span class="intro-lv">{{ label }}</span><b>{{ title }}</b>
    </div>

    <div class="intro-stage">
      <div class="intro-spot"></div>
      <div class="intro-hero">
        <img :src="art" alt="海姐" />
      </div>
    </div>

    <button class="intro-skip" type="button" @click="finish">略過劇情 ▸▸</button>

    <div class="intro-dialogue" @click="advance">
      <div class="intro-name">海姐</div>
      <p class="intro-line" v-html="currentText"></p>
      <div class="intro-foot">
        <div class="intro-dots">
          <i v-for="n in beats.length" :key="n" :class="{ on: n - 1 === index }"></i>
        </div>
        <div v-if="!isLast" class="intro-next">繼續 <span class="car">▸</span></div>
        <button v-else class="intro-enter" type="button" @click.stop="finish">進入控制室 →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { IntroBeat } from "./types";

const props = defineProps<{
  label: string;
  title: string;
  beats: IntroBeat[];
}>();
const emit = defineEmits<{ (e: "done"): void }>();

const coachImages: Record<string, string> = {
  normal: `${import.meta.env.BASE_URL}images/coach/normal.png`,
  praise: `${import.meta.env.BASE_URL}images/coach/praise.png`,
  proud: `${import.meta.env.BASE_URL}images/coach/proud.png`,
  confused: `${import.meta.env.BASE_URL}images/coach/confused.png`
};

const index = ref(0);
const current = computed<IntroBeat>(() => props.beats[index.value] ?? props.beats[0]);
const currentText = computed(() => current.value?.text ?? "");
const art = computed(() => coachImages[current.value?.art ?? "normal"] ?? coachImages.normal);
const isLast = computed(() => index.value >= props.beats.length - 1);

function advance() {
  if (!isLast.value) index.value += 1;
}
function finish() {
  emit("done");
}
</script>

<style scoped>
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    radial-gradient(1100px 600px at 78% -10%, rgba(88, 210, 192, 0.1), transparent 60%),
    radial-gradient(900px 600px at 12% 110%, rgba(246, 179, 90, 0.1), transparent 60%),
    linear-gradient(160deg, #0c1422, #0a1019 60%, #0b1320);
  color: #e8eef8;
  font-family: Inter, "Noto Sans TC", system-ui, sans-serif;
  overflow: hidden;
}
.intro-chapter {
  margin: 26px auto 0;
  padding: 8px 22px;
  border: 1px solid rgba(120, 150, 200, 0.18);
  border-radius: 999px;
  background: rgba(22, 32, 50, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  gap: 12px;
  align-items: center;
}
.intro-chapter b {
  font-size: 15px;
  letter-spacing: 0.4px;
}
.intro-lv {
  color: #58d2c0;
  font-family: var(--mono, monospace);
  font-size: 12px;
}
.intro-stage {
  position: relative;
}
.intro-stage::before {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 46%;
  background:
    repeating-linear-gradient(90deg, rgba(120, 150, 200, 0.05) 0 2px, transparent 2px 120px),
    linear-gradient(180deg, transparent, rgba(8, 13, 22, 0.6));
  mask-image: linear-gradient(180deg, transparent, #000 40%);
}
.intro-hero {
  position: absolute;
  left: 8%;
  bottom: -6px;
  width: 320px;
  max-width: 28vw;
  filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 40px rgba(88, 210, 192, 0.18));
  animation: intro-float 5s ease-in-out infinite;
}
.intro-hero img {
  width: 100%;
  display: block;
  border-radius: 18px;
}
.intro-spot {
  position: absolute;
  left: 5%;
  bottom: -40px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(88, 210, 192, 0.2), transparent 62%);
  filter: blur(6px);
}
@keyframes intro-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}
.intro-dialogue {
  margin: 0 clamp(20px, 5vw, 80px) 44px;
  align-self: end;
  border: 1px solid rgba(88, 210, 192, 0.28);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(18, 30, 46, 0.94), rgba(12, 20, 34, 0.96));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  padding: 22px 26px 18px;
  cursor: pointer;
  position: relative;
}
.intro-name {
  position: absolute;
  top: -16px;
  left: 26px;
  padding: 6px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #1f6f64, #58d2c0);
  color: #04201c;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 6px 18px rgba(88, 210, 192, 0.35);
}
.intro-line {
  font-size: 18px;
  line-height: 1.9;
  min-height: 80px;
  letter-spacing: 0.2px;
  padding-top: 8px;
  margin: 0;
}
.intro-line :deep(b) {
  color: #f6b35a;
}
.intro-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
.intro-dots {
  display: flex;
  gap: 6px;
}
.intro-dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(141, 163, 196, 0.3);
}
.intro-dots i.on {
  background: #58d2c0;
  box-shadow: 0 0 10px #58d2c0;
}
.intro-next {
  margin-left: auto;
  color: #58d2c0;
  font-size: 14px;
}
.intro-next .car {
  animation: intro-blink 1.1s steps(1) infinite;
}
.intro-enter {
  margin-left: auto;
  padding: 11px 26px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #1f6f64, #2aa392);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 10px 26px rgba(42, 163, 146, 0.4);
}
.intro-skip {
  position: absolute;
  top: 26px;
  right: 28px;
  color: #8da3c4;
  font-size: 13px;
  cursor: pointer;
  background: none;
  border: none;
  font-weight: 600;
}
.intro-skip:hover {
  color: #e8eef8;
  transform: none;
}
@keyframes intro-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
