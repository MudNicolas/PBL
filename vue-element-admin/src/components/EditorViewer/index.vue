<template>
    <div class="view-wrapper">
        <div class="fr-box fr-basic">
            <div class="fr-element">
                <froalaView v-model="content"></froalaView>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["content"],
}
</script>

<style>
.view-wrapper {
    border: 1px solid #dcdfe6;
    border-radius: 10px;
}
</style>
