<script setup>

</script>

<template>
<main>
    <div class="container">
            <div class="card-container">
                <div class="card">
                    <h1>Test</h1>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                </div>
                <div class="card">
                    <h1>Test</h1>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                </div>
                <div class="card">
                    <h1>Test</h1>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                </div>
                <div class="card">
                    <h1>Test</h1>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                </div>
                <div class="card">
                    <h1>Test</h1>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
                    <p>Test</p>
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
}

.container {
    margin: 80px;
    display: flex;
    flex-direction: column;
    transition: ease-in-out 0.5s;

    .card-container {
        display: flex;
        flex-wrap: wrap;
        // justify-content: center;

        .card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            font-family: "Poppins", sans-serif;
            background-color: #ecf0f1;
            width: 250px;
            height: 250px;
            padding: 13px;
            border-radius: 15px;
            box-shadow: 10px 10px 46px -19px rgba(0, 0, 0, 0.75);
            margin-top: 30px;
            margin-bottom: 15px;
            transition: ease-in-out 0.5s;
            backdrop-filter: blur(10px);

            .button-action {
                width: 100%;

                button {
                    font-family: "Poppins", sans-serif;
                    border: none;
                    padding: 5px;
                    margin-top: 5px;
                    border-radius: 15px;
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
}
</style>