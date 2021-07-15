<template>
    <div class="wrapper">
        <img :src="img" />
        <div class="content">
            <div class="info">
                <div>你正在进行一个敏感操作</div>
                <div>请在框内输入密码来验证你的身份</div>
            </div>
            <el-input type="password" v-model="password" />
            <el-button
                @click="submit"
                :loading="loading"
                style="width: 100%; margin-top: 12px"
                type="primary"
            >
                确认
            </el-button>
        </div>
    </div>
</template>

<script>
import img from "@/assets/verificate_images/verificate.webp"
import request from "@/utils/request"
import md5 from "js-md5"
export default {
    name: "Verificate",
    data() {
        return {
            password: "",
            img: img,
            loading: false,
            url: "",
            params: {},
        }
    },
    created() {
        if (!this.$route.params || !this.$route.params.url) {
            this.$router.replace("/401")
        }
        this.url = this.$route.params.url
        this.params = this.$route.params.params
    },
    methods: {
        submit() {
            this.loading = true
            this.params.password = md5(this.password)
            request({
                url: this.url,
                method: "post",
                data: this.params,
            })
                .then(() => {
                    this.$message({
                        message: "操作成功",
                        type: "success",
                    })
                    this.$router.go(-1)
                })
                .catch(() => {
                    this.loading = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .info {
        margin-bottom: 22px;
        text-align: center;
        line-height: 24px;
        color: #303133;
    }
}
</style>
