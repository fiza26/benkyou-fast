<script setup>
import { RouterLink, RouterView } from 'vue-router'
import router from '@/router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'


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
      <RouterLink :to="'/'"><span>
        <Icon icon="mdi:home" style="font-size: 25px; vertical-align: middle;" color="black" />
          <!-- Home -->
        </span></RouterLink>
      <div class="nav-link">
        <span><Icon icon="iconoir:leaderboard-star"  style="font-size: 25px; margin-right: 6px; color: black" /> Leaderboard</span>
        <span><Icon icon="grommet-icons:scorecard"  style="font-size: 19px; margin-right: 6px; color: black" /> 3500 Points</span>
        <span @click='logout()'><Icon icon="solar:logout-broken" width="24" height="24" /> Logout</span>
      </div>
    </nav>
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
  justify-content: space-around;
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

nav span {
  display: flex;
  align-items: center;
  cursor: pointer;
}

nav .nav-link {
  display: flex;
  justify-content: space-around;
  width: 350px;
}
</style>
