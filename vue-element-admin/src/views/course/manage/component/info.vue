<template>
    <div style="padding-top: 15px" v-loading="loading">
        <el-form ref="course" :model="course" label-width="80px">
            <el-row>
                <el-col :span="16">
                    <el-form-item label="课程名称">
                        <el-input v-model="course.name" spellcheck="false" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="16">
                    <el-form-item label="课程简介">
                        <el-input
                            type="textarea"
                            v-model="course.introduction"
                            :rows="5"
                            spellcheck="false"
                            :disabled="!isEdit"
                        ></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row v-if="isEdit">
                <el-col :span="16">
                    <el-form-item>
                        <el-button @click="imagecropperShow = true">上传课程封面</el-button>
                        <el-button plain @click="toDefaultCover">恢复为默认封面</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="16">
                    <el-form-item label="课程封面">
                        <div class="block image-loading-wrap-intro">
                            <el-image
                                style="width: 300px; height: 180px"
                                :src="coverUrl"
                                :preview-src-list="srcCoverUrl"
                            >
                                <div slot="placeholder" class="el-image__placeholder">
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
                </el-col>
            </el-row>
            <el-form-item style="margin-top: 12px">
                <el-button @click="isEdit = false" v-if="isEdit">取消</el-button>
                <el-button type="primary" @click="submit" v-if="isEdit" key="profile-submit-buttom">
                    确认提交
                </el-button>
                <el-button
                    :loading="submitting"
                    @click="isEdit = true"
                    v-if="!isEdit"
                    key="profile-to-edit-buttom"
                >
                    更新信息
                </el-button>
            </el-form-item>
        </el-form>

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
import ImageCropper from "@/components/ImageCropper"
import { getInfo, submitEdit } from "@/api/course"

export default {
    name: "ManageCourseInfo",
    components: { ImageCropper },
    props: ["courseId"],
    data() {
        return {
            imgType: "courseCover",
            imagecropperShow: false,
            imagecropperKey: 0,
            course: {
                name: "",
                introduction: "",
                cover: "",
            },
            coverUrl: "",
            srcCoverUrl: [],
            isEdit: false,
            loading: true,
            submitting: false,
            path: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_COVER_PATH,
        }
    },
    created() {
        this.getInfo()
    },
    methods: {
        cropSuccess(resData) {
            this.imagecropperShow = false
            this.imagecropperKey = this.imagecropperKey + 1
            /* console.log(resData); */
            let url = this.path + resData.coverFilename
            this.srcCoverUrl = [url]
            this.course.cover = resData.coverFilename
            this.coverUrl = url
        },
        close() {
            this.imagecropperShow = false
        },
        getInfo() {
            getInfo({ courseID: this.courseId }).then(res => {
                this.course = res.data.courseInfo
                this.coverUrl = res.data.coverUrl
                this.srcCoverUrl = [this.coverUrl]
                this.loading = false
            })
        },
        getCover() {
            let url = this.path + this.course.cover
            this.srcCoverUrl = [url]
            this.coverUrl = url
        },
        toDefaultCover() {
            this.course.cover = "default.jpg"
            this.getCover()
        },
        submit() {
            this.course.introduction = this.course.introduction.trim()
            this.submitting = true
            submitEdit({ course: this.course, courseID: this.course._id })
                .then(res => {
                    this.$message({
                        type: "success",
                        message: res.message,
                    })
                    this.submitting = false
                    this.isEdit = false
                })
                .catch(() => {
                    this.submitting = false
                })
        },
    },
}
</script>

<style scoped>
.image-loading-wrap-intro {
    width: 300px;
    height: 180px;
    margin-top: 14px;

    background: #f5f7fa;
}
</style>
