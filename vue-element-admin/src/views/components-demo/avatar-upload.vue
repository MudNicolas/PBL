<template>
    <div class="components-container">
        <aside>
            This is based on
            <a class="link-type" href="//github.com/dai-siki/vue-image-crop-upload">
                vue-image-crop-upload
            </a>
            . Since I was using only the vue@1 version, and it is not compatible with mockjs at the
            moment, I modified it myself, and if you are going to use it, it is better to use
            official version.
        </aside>

        <pan-thumb :image="image" />

        <el-button
            type="primary"
            icon="el-icon-upload"
            style="position: absolute; bottom: 15px; margin-left: 40px"
            @click="imagecropperShow = true"
        >
            Change Avatar
        </el-button>

        <image-cropper
            v-show="imagecropperShow"
            :key="imagecropperKey"
            :width="300"
            :height="300"
            :url="url"
            lang-type="zh"
            @close="close"
            @crop-upload-success="cropSuccess"
        />
    </div>
</template>

<script>
import ImageCropper from "@/components/ImageCropper"
import PanThumb from "@/components/PanThumb"

export default {
    name: "AvatarUploadDemo",
    components: { ImageCropper, PanThumb },
    data() {
        return {
            imagecropperShow: false,
            imagecropperKey: 0,
            image: "https://wpimg.wallstcn.com/577965b9-bb9e-4e02-9f0c-095b41417191",
        }
    },
    methods: {
        cropSuccess(resData) {
            this.imagecropperShow = false
            this.imagecropperKey = this.imagecropperKey + 1
            //console.log(resData);
            this.image = resData.avatar
            this.$store.dispatch("user/changeAvatar", resData.avatar).then(() => {
                this.$message({
                    message: "更换头像成功",
                    type: "success",
                })
                this.$emit("changeAvatar")
            })
        },
        close() {
            this.imagecropperShow = false
        },
    },
}
</script>

<style scoped>
.avatar {
    width: 200px;
    height: 200px;
    border-radius: 50%;
}
</style>

