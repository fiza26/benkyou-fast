<script setup>

</script>

<template>
    <main>
        <div class="container">
            <div class="card-container">
                <div class="login-card">
                    <label for="">Email</label><br><br>
                    <input type="text" placeholder="Enter your email" required>
                    <label for="">Password</label><br><br>
                    <input type="password" placeholder="Enter your password" required>
                    <button type="submit">Login</button>
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

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

        .login-card {
            // display: flex;
            // flex-direction: column;
            // justify-content: space-between;
            // align-items: center;
            // text-align: center;
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 350px;
            height: 370px;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);

            label {
                margin-bottom: 10px;
            }

            input {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border-radius: 15px;
                padding: 10px;
                border: none;
                margin-bottom: 25px;
            }

            button {
                font-family: "Poppins", sans-serif;
                width: 100%;
                border: none;
                border-radius: 15px;
                padding: 10px;
                color: white;
                cursor: pointer;
                background: linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%);
            }

        }
    }
}
</style>