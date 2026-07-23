<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const streakModalState = ref(false) // Changed to false to prevent flash before logic runs
const lastLoginLoaded = ref(false)
const currentStreak = ref(0)
const wordsLearned = ref(0)
const leaderboardRanking = ref(null)
const lastLogin = ref(null)
const ifLastLogin = ref(false)
const daysDifference = ref(0)
const usersData = ref([])

onMounted(async () => {
  await userStore.getCurrentUser()
  if (userStore.name) {
    await getCurrentStreak()
    await checkLastLogin()
    await getWordsLearned()
    await checkLeaderboardRanking()
  }
})

function getDateDiffInDays(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  const diffTime = d2 - d1
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

async function checkLastLogin() {
  const { data, error } = await supabase
    .from('users_data')
    .select('last_login')
    .eq('name', userStore.name)
    .single()

  if (error) return console.error('Error checking last login:', error.message)

  lastLogin.value = data.last_login
  lastLoginLoaded.value = true

  const today = new Date()
  const last = new Date(lastLogin.value)
  const todayStr = today.toISOString().split('T')[0]
  const lastStr = last.toISOString().split('T')[0]

  ifLastLogin.value = todayStr === lastStr
  daysDifference.value = getDateDiffInDays(last, today)

  if (!ifLastLogin.value) {
    await updateDayStreak()
    await updateTimestamp()
    streakModalState.value = true
  }
}

async function getCurrentStreak() {
  const { data, error } = await supabase.from('users_data').select('day_streak').eq('name', userStore.name).single()
  if (error) return
  currentStreak.value = data.day_streak;
}

const closeStreakModal = (() => { streakModalState.value = false })

async function updateDayStreak() {
  let newStreak = 1
  if (daysDifference.value === 1) {
    newStreak = currentStreak.value + 1
  } else if (daysDifference.value === 0) {
    newStreak = currentStreak.value
  } else {
    newStreak = 1
  }

  const { error } = await supabase.from('users_data').update({ day_streak: newStreak }).eq('name', userStore.name)
  if (error) window.alert('Error updating day streak: ' + error.message)
  else currentStreak.value = newStreak
}

async function updateTimestamp() {
  const todayDateOnly = new Date()
  todayDateOnly.setUTCHours(0, 0, 0, 0)
  const { error } = await supabase.from('users_data').update({ last_login: todayDateOnly }).eq('name', userStore.name)
  if (error) window.alert('Error updating timestamp: ' + error.message)
}

async function getWordsLearned() {
  const { data, error } = await supabase.from('users_data').select('words_learned').eq('name', userStore.name)
  if (!error) wordsLearned.value = data[0].words_learned
}

async function checkLeaderboardRanking() {
  const { data, error } = await supabase.from('users_data').select('name, words_learned, points').order('points', { ascending: false })
  if (error) return
  usersData.value = data
  const index = usersData.value.findIndex(user => user.name === userStore.name)
  leaderboardRanking.value = index !== -1 ? index + 1 : null
}
</script>

<template>
  <main>
    <div class="modal" v-if="streakModalState">
      <div class="modal-content">
        <Icon icon="fluent-emoji:fire" width="100" height="100" />
        <h1>{{ currentStreak }} day streak</h1>
        <p>Let's continue the journey</p>
        <button @click="closeStreakModal()">Okay</button>
      </div>
    </div>

    <div class="container">
      <div class="profile-container">
        <div class="profile">
          <div class="box-number">
            <span>{{ currentStreak }}</span>
            <p>Days streak</p>
          </div>
          <div class="box-number">
            <span>{{ wordsLearned }}</span>
            <p>Words learned</p>
          </div>
          <div class="box-number">
            <span>{{ leaderboardRanking }}</span>
            <p>On leaderboard</p>
          </div>
        </div>
      </div>

      <div class="card-container">

        <div class="card">
          <div class="card-glass-bottom">
            <div class="text-section">
              <h3>Basic Mastery</h3>
              <p>🚀 Learn Japanese words one by one.</p>
            </div>
            <RouterLink :to="'/learn'" class="btn-link">
              <button>Learn
                <Icon icon="solar:alt-arrow-right-bold" />
              </button>
            </RouterLink>
          </div>
        </div>

        <div class="card">
          <div class="card-glass-bottom">
            <div class="text-section">
              <h3>Retention Review</h3>
              <p>🗃️ Relearn all the words mastered so far.</p>
            </div>
            <RouterLink :to="'/learntwo'" class="btn-link">
              <button>Review
                <Icon icon="solar:alt-arrow-right-bold" />
              </button>
            </RouterLink>
          </div>
        </div>

        <div class="card">
          <div class="card-glass-bottom">
            <div class="text-section">
              <h3>AI Acquisition</h3>
              <p>✨ Advanced AI-powered language immersion.</p>
            </div>
            <RouterLink :to="'/learnthree'" class="btn-link">
              <button>Advanced
                <Icon icon="solar:alt-arrow-right-bold" />
              </button>
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

main {
  margin-top: 80px;
  font-family: "Poppins", sans-serif;
}

/* Original Modal Logic - Preserved */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;

  .modal-content {
    animation: moveUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
    color: white;
    padding: 30px;
    border-radius: 20px 20px 0 0;
    width: 70%;
    max-width: 500px;
    position: fixed;
    bottom: 0;
    text-align: center;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);

    button {
      font-family: 'Poppins', sans-serif;
      margin-top: 13px;
      border: none;
      padding: 10px 30px;
      border-radius: 15px;
      background-color: white;
      font-weight: bold;
      cursor: pointer;
      transition: 0.3s ease-in-out;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;

  .profile-container {
    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
    color: white;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 15px 35px rgba(58, 71, 213, 0.25);
    min-height: 250px;
    display: flex;
    align-items: center;

    .profile {
      display: flex;
      justify-content: space-around;
      width: 100%;

      .box-number {
        text-align: center;

        span {
          font-size: clamp(45px, 8vw, 90px);
          font-weight: 800;
          line-height: 1;
        }

        p {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 5px;
          opacity: 0.9;
        }
      }
    }
  }

  /* NEW GRID CARD SYSTEM */
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;

    .card {
      height: 280px;
      border-radius: 24px;
      overflow: hidden;
      background-image: url("@/assets/doodle-art.jpg"); // Fixed path
      background-size: cover;
      background-position: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

        .card-glass-bottom {
          background: rgba(255, 255, 255, 0.98);
        }
      }

      .card-glass-bottom {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        padding: 24px;
        height: 60%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.4);
      }

      .text-section {
        h3 {
          color: #3a47d5;
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.4;
          margin-bottom: 7px;
        }
      }

      .btn-link {
        text-decoration: none;
      }

      button {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        border: none;
        padding: 10px;
        width: 100%;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: 0.3s ease;

        &:hover {
          filter: brightness(1.1);
          gap: 12px;
        }
      }
    }
  }
}

@keyframes moveUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .container {
    margin: 20px auto;
  }

  .profile-container {
    padding: 30px 15px;
  }
}
</style>