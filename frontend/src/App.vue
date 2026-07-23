<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import router from '@/router'
import { Icon } from '@iconify/vue'
import supabase from '@/supabase'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const route = useRoute()
const mobileNavState = ref(false)
const userPoints = ref(0)

onMounted(async () => {
  if (userStore.name) {
    await getPoints()
  }
})

watch(
  () => userStore.name,
  (newName) => { if (newName) getPoints() }
)

async function getPoints() {
  if (!userStore.name) return
  const { data, error } = await supabase.from('users_data').select('points').eq('name', userStore.name).single()
  if (!error) userPoints.value = data.points
}

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (!error) router.push({ name: 'login' })
}

const toggleMobileNav = () => {
  mobileNavState.value = !mobileNavState.value
}
</script>

<template>
  <header v-if="route.name != 'landing' && route.name != 'login'">
    <nav class="navbar">
      <div class="nav-container">
        <RouterLink to="/" class="brand">
          <!-- <div class="logo-circle">
            <Icon icon="solar:Lo-Fi-bold-duotone" class="logo-icon" />
          </div> -->
          <span class="brand-name">BENKYOU FAST</span>
        </RouterLink>

        <div class="nav-links">
          <RouterLink to="/leaderboard" class="nav-item">
            <Icon icon="solar:ranking-bold-duotone" />
            <span>Leaderboard</span>
          </RouterLink>

          <div class="points-badge">
            <Icon icon="solar:star-bold" class="star-icon" />
            <span>{{ userPoints }} <small>PTS</small></span>
          </div>

          <button @click="logout" class="logout-btn">
            <Icon icon="solar:logout-3-bold-duotone" />
          </button>
        </div>

        <button class="mobile-toggle" @click="toggleMobileNav">
          <Icon :icon="mobileNavState ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'" />
        </button>
      </div>
    </nav>

    <Transition name="fade">
      <div class="sidebar-overlay" v-if="mobileNavState" @click="toggleMobileNav"></div>
    </Transition>

    <Transition name="slide">
      <aside class="sidebar" v-if="mobileNavState">
        <div class="sidebar-header">
          <div class="user-profile">
            <div class="avatar">{{ userStore.name?.charAt(0) || 'U' }}</div>
            <div class="user-info">
              <p class="name">{{ userStore.name }}</p>
              <p class="points-text">{{ userPoints }} Points</p>
            </div>
          </div>
        </div>

        <div class="sidebar-links">
          <RouterLink to="/" @click="toggleMobileNav" class="side-item">
            <Icon icon="solar:home-2-bold-duotone" /> Home
          </RouterLink>
          <RouterLink to="/leaderboard" @click="toggleMobileNav" class="side-item">
            <Icon icon="solar:ranking-bold-duotone" /> Leaderboard
          </RouterLink>
          <hr class="side-divider" />
          <button @click="logout" class="side-item logout">
            <Icon icon="solar:logout-3-bold-duotone" /> Logout
          </button>
        </div>
      </aside>
    </Transition>
  </header>

  <div class="page-content">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
* {
  font-family: 'Poppins', sans-serif;
}

.navbar {
  position: fixed;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-width: 1200px;
  height: 70px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);

  .nav-container {
    height: 100%;
    padding: 0 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;

  .logo-circle {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
  }

  .brand-name {
    font-weight: 800;
    color: #1e293b;
    font-size: 1.1rem;
    letter-spacing: -0.5px;
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-weight: 600;
    font-size: 0.95rem;
    transition: 0.3s;
    text-decoration: none;

    &:hover {
      color: #3a47d5;
    }

    &.router-link-active {
      color: #3a47d5;
    }
  }
}

.points-badge {
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1e293b;
  border: 1px solid #e2e8f0;

  .star-icon {
    color: #f59e0b;
  }

  small {
    font-size: 0.6rem;
    opacity: 0.5;
  }
}

.logout-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 28px;
  color: #1e293b;
  cursor: pointer;
}

/* Sidebar & Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1001;
}

.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: white;
  z-index: 1002;
  padding: 30px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);

  .sidebar-header {
    margin-bottom: 40px;

    .user-profile {
      display: flex;
      align-items: center;
      gap: 15px;

      .avatar {
        width: 50px;
        height: 50px;
        background: #3a47d5;
        color: white;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
      }

      .name {
        font-weight: 700;
        color: #1e293b;
      }

      .points-text {
        font-size: 0.85rem;
        color: #64748b;
      }
    }
  }

  .sidebar-links {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .side-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      text-decoration: none;
      color: #64748b;
      font-weight: 600;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: #f1f5f9;
        color: #3a47d5;
      }

      &.router-link-active {
        background: #eff6ff;
        color: #3a47d5;
      }

      &.logout {
        color: #ef4444;

        &:hover {
          background: #fef2f2;
        }
      }
    }

    .side-divider {
      border: none;
      border-top: 1px solid #f1f5f9;
      margin: 10px 0;
    }
  }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }

  .navbar {
    height: 60px;
    top: 10px;
  }
}

.page-content {
  padding-top: 30px;
}
</style>