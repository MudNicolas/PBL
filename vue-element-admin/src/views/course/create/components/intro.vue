<template>
    <div>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <div class="info">
                        标 *
                        的为必填项&nbsp;&nbsp;|&nbsp;&nbsp;未上传封面使用默认封面
                    </div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item label="课程名称*">
                    <el-input
                        v-model="course.name"
                        spellcheck="false"
                    ></el-input>
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item label="课程简介">
                    <el-input
                        type="textarea"
                        v-model="course.introduction"
                        :rows="5"
                        spellcheck="false"
                    ></el-input>
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <el-button @click="imagecropperShow = true">
                        上传课程封面
                    </el-button>
                    <el-button plain @click="toDefaultCover">
                        恢复为默认封面
                    </el-button>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item label="课程封面">
                    <div class="block image-loading-wrap-intro">
                        <el-image
                            style="width: 300px; height: 180px"
                            :src="coverUrl"
                            :preview-src-list="srcCoverUrl"
                        >
                            <div
                                slot="placeholder"
                                class="el-image__placeholder"
                            >
                                <div
                                    style="
                                        width: 100%;
                                        height: 100%;
                                        display: block;
                                        background: #f5f7fa;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                    "
                                >
                                    <i class="el-icon-loading"></i>
                                    <div style="color: #999999">加载中</div>
                                </div>
                            </div>
                        </el-image>
                    </div>
                </el-form-item>
            </el-col></el-row
        >
        <el-row>
            <el-col :span="16" :offset="4" style="margin-top: 16px">
                <el-form-item>
                    <el-button style="margin-top: 12px" @click="prev"
                        >上一步</el-button
                    >

                    <el-button
                        style="margin-top: 12px"
                        @click="next"
                        type="primary"
                        :disabled="course.name.trim() == ''"
                        >下一步</el-button
                    >
                </el-form-item>
            </el-col>
        </el-row>

        <image-cropper
            v-show="imagecropperShow"
            :key="imagecropperKey"
            :width="500"
            :height="300"
            lang-type="zh"
            @close="close"
            @crop-upload-success="cropSuccess"
            :img-type="imgType"
        />
    </div>
</template>

<script>
import ImageCropper from "@/components/ImageCropper";
import { getCover } from "@/api/course";

export default {
    name: "courseIntro",
    components: { ImageCropper },
    props: ["course"],
    data() {
        return {
            imgType: "courseCover",
            imagecropperShow: false,
            imagecropperKey: 0,
            srcCoverUrl: [this.coverUrl],
            coverUrl: "",
        };
    },
    created() {
        this.getCover();
    },
    methods: {
        cropSuccess(resData) {
            this.imagecropperShow = false;
            this.imagecropperKey = this.imagecropperKey + 1;
            /* console.log(resData); */

            this.srcCoverUrl = [resData.url];
            this.course.cover = resData.coverFilename;
            this.coverUrl = resData.url;
        },
        close() {
            this.imagecropperShow = false;
        },
        getCover() {
            let path =
                process.env.VUE_APP_PUBLIC_PATH +
                VUE_APP_COVER_PATH +
                course.cover;

            this.srcCoverUrl = [path];
            this.coverUrl = path;
        },
        toDefaultCover() {
            this.course.cover = "default.jpg";
            this.getCover();
        },
        next() {
            this.$emit("next");
        },
        prev() {
            this.$emit("prev");
        },
    },
};
</script>

<style scoped>
.image-loading-wrap-intro {
    width: 300px;
    height: 180px;
    margin-top: 14px;

    background: #f5f7fa;
}
</style>
