<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <main>
    <div class="container">
      <div class="profile-container">
        <div class="profile">
          <div class="box-number">
            <span>11</span>
            <p>Days streak</p>
          </div>
          <div class="box-number">
            <span>30</span>
            <p>Words learned</p>
          </div>
          <div class="box-number">
            <span>#5</span>
            <p>On leaderboard</p>
          </div>
        </div>
      </div>

      <div class="card-container">
        <div class="card">
          <p>This is a card we are talking about, yes this is a card.</p>
          <RouterLink :to="'/learn'"><button>Learn ></button></RouterLink>
        </div>

        <div class="card">
          <p>This is a card we are talking about, yes this is a card.</p>
          <button>Learn ></button>
        </div>

        <div class="card">
          <p>This is a card we are talking about, yes this is a card.</p>
          <button>Learn ></button>
        </div>
      </div>
    </div>

  </main>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

main {
  margin-top: 80px;
}

.container {
  margin: 80px;
  display: flex;
  flex-direction: column;
  transition: ease-in-out 0.5s;

  .profile-container {
    display: flex;
    align-items: center;
    font-family: "Poppins", sans-serif;
    color: white;
    border-radius: 15px;
    padding: 13px;
    background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
    height: 300px;
    box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);

    .profile {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      width: 100%;

      .box-number {
        text-align: center;

        span {
          font-size: 100px;
        }
      }
    }
  }

  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: "Poppins", sans-serif;
      background-color: #ecf0f1;
      max-width: 380px;
      height: 200px;
      padding: 13px;
      border-radius: 15px;
      box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
      margin-top: 30px;
      margin-bottom: 15px;
      transition: ease-in-out 0.5s;
      backdrop-filter: blur(10px);
      background-color: #e5e5f7;
      opacity: 0.8;
      background-size: 20px 20px;
      background-image: repeating-linear-gradient(0deg, #00d2ff, #3a47d5 1px, #e5e5f7 1px, #e5e5f7);

      button {
        font-family: "Poppins", sans-serif;
        border: none;
        padding: 5px;
        border-radius: 15px;
        width: 100%;
        background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
        color: white;
        transition: ease-in-out 0.5s;
        cursor: pointer;

        &:hover {
          transform: scale(1.030);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .container .profile-container .profile .box-number span {
    font-size: 50px;
  }
}
</style>
