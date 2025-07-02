<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import router from '@/router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const route = useRoute()

onMounted(async () => {
  if (userStore.name) {
    await getPoints()
  }
})

watch(
  () => userStore.name,
  (newName) => {
    if (newName) {
      getPoints()
    }
  }
)

const mobileNavState = ref(false)

const showMobileNav = () => {
  mobileNavState.value = !mobileNavState.value
}

const userPoints = ref(null)

async function getPoints() {
  if (!userStore.name) return 
  const { data, error } = await supabase.from('users_data').select('points').eq('name', userStore.name).single()

  if (error) {
    console.error('Error fetching user points', error.message)
    return
  }

  userPoints.value = data.points
}

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push({ name: 'login' })
    } else {
      console.error('Logout error', error)
    }
  } catch (err) {
    console.error('Unexpected error', err)
  }
}
</script>

<template>
  <header>
    <nav>
      <div class="home">
        <RouterLink :to="'/'" v-if="route.name != 'login'"><span>
            <Icon icon="mdi:home" style="font-size: 25px; vertical-align: middle;" color="black" />
            <!-- Home -->
          </span></RouterLink>
      </div>
      <div class="nav-link">
        <RouterLink :to="'/leaderboard'"><span v-if="route.name != 'login'">
            <Icon icon="iconoir:leaderboard-star" style="font-size: 25px; margin-right: 6px; color: black" />
            Leaderboard
          </span></RouterLink>
        <span v-if="route.name != 'login'">
          <Icon icon="grommet-icons:scorecard" style="font-size: 19px; margin-right: 6px; color: black" /> {{ userPoints }} Points
        </span>
        <span @click='logout()' v-if="route.name != 'login'">
          <Icon icon="solar:logout-broken" width="24" height="24" /> Logout
        </span>
      </div>
      <div class="mobile-nav-link">
        <Icon icon="arcticons:hamburger-menu" width="30" height="30" @click="showMobileNav()" />
      </div>
    </nav>
    <div class="mobile-sidebar" v-if="mobileNavState">
      <div class="sidebar-content">
        <span @click="mobileNavState = false" class="close-btn">✕</span>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/leaderboard">Leaderboard</RouterLink>
        <span>{{ userPoints }} Points</span>
        <span @click="logout">Logout</span>
      </div>
    </div>

  </header>
  <RouterView />
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Poppins", sans-serif;
  background-color: #dddd;
}

a {
  text-decoration: none;
  color: black;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 1;
  background-color: #ecf0f1;
  -webkit-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
  box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
}

nav .home {
  margin-left: 80px;
}

nav span {
  display: flex;
  align-items: center;
  cursor: pointer;
}

nav .nav-link {
  display: flex;
  justify-content: space-around;
  width: 350px;
  margin-right: 80px
}

nav .mobile-nav-link {
  display: none;
  cursor: pointer;
}

.mobile-sidebar {
  position: fixed;
  top: 60px; // below the navbar
  left: 0;
  width: 100%;
  height: calc(100% - 60px); // fill remaining screen
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2;
  display: flex;
  justify-content: flex-start;
}

.sidebar-content {
  width: 250px;
  background-color: #fff;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform: translateX(-100%);
  animation: slideIn 0.3s forwards;
}

.sidebar-content a,
.sidebar-content span {
  font-size: 18px;
  color: black;
  cursor: pointer;
}

.close-btn {
  align-self: flex-end;
  font-size: 20px;
  cursor: pointer;
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  nav .nav-link {
    display: none;
  }

  nav .mobile-nav-link {
    display: block;
    margin-right: 80px;
  }
}
</style>
