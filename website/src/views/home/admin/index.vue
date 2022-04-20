<template>
    <div class="dashboard-editor-container">
        <div class="clearfix">
            <pan-thumb :image="path + avatar" style="float: left">
                Your role:
                <span v-for="item in roles" :key="item" class="pan-info-roles">{{ item }}</span>
            </pan-thumb>
            <div class="info-container">
                <span class="display_name">{{ name }}</span>
                <span style="font-size: 20px; padding-top: 20px; display: inline-block">
                    {{ helloText }}
                </span>
            </div>
        </div>
        <div>
            <img src="@/assets/empty_images/empty.gif" class="emptyGif" />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex"
import PanThumb from "@/components/PanThumb"

export default {
    name: "DashboardEditor",
    components: { PanThumb },
    data() {
        let now = new Date(),
            hour = now.getHours()
        let helloText
        if (hour < 6) {
            helloText = "凌晨好"
        } else if (hour < 9) {
            helloText = "早上好"
        } else if (hour < 12) {
            helloText = "上午好"
        } else if (hour < 14) {
            helloText = "中午好"
        } else if (hour < 17) {
            helloText = "下午好"
        } else if (hour < 19) {
            helloText = "傍晚好"
        } else {
            helloText = "晚上好"
        }
        return {
            path: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            helloText,
        }
    },
    computed: {
        ...mapGetters(["name", "avatar", "roles"]),
    },
}
</script>

<style lang="scss" scoped>
.emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
}

.dashboard-editor-container {
    background-color: #e3e3e3;
    min-height: 100vh;
    padding: 50px 60px 0px;
    .pan-info-roles {
        font-size: 12px;
        font-weight: 700;
        color: #333;
        display: block;
    }
    .info-container {
        position: relative;
        margin-left: 190px;
        height: 150px;
        line-height: 200px;
        .display_name {
            font-size: 48px;
            line-height: 48px;
            color: #212121;
            position: absolute;
            top: 25px;
        }
    }
}
</style>
