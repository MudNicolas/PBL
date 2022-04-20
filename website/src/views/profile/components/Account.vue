<template>
    <div>
        <el-form>
            <el-form-item label="Name">
                <el-input v-model="user.name" :disabled="!isEdit" />
            </el-form-item>

            <el-form-item label="Introduction">
                <el-input v-model="user.introduction" :disabled="!isEdit" />
            </el-form-item>
            <el-form-item>
                <el-button @click="isEdit = false" v-if="isEdit">
                    取消
                </el-button>
                <el-button
                    type="primary"
                    @click="submit"
                    v-if="isEdit"
                    key="profile-submit-buttom"
                >
                    确认提交
                </el-button>
                <el-button
                    type="primary"
                    :loading="loading"
                    @click="isEdit = true"
                    v-if="!isEdit"
                    key="profile-to-edit-buttom"
                >
                    更新信息
                </el-button>
                <el-button
                    style="margin-left: 16px"
                    type="text"
                    @click="imagecropperShow = true"
                    v-show="!isEdit"
                >
                    更换头像
                </el-button>
                <el-button
                    style="margin-left: 16px"
                    type="text"
                    @click="changePWDVisible = true"
                    v-show="!isEdit"
                >
                    修改密码
                </el-button>
            </el-form-item>
        </el-form>
        <image-cropper
            v-show="imagecropperShow"
            :key="imagecropperKey"
            :width="300"
            :height="300"
            lang-type="zh"
            @close="close"
            @crop-upload-success="cropSuccess"
            :img-type="imgType"
        />
        <el-dialog
            title="修改密码"
            :visible.sync="changePWDVisible"
            :close-on-click-modal="closeOnClickModal"
        >
            <el-form :model="form">
                <el-form-item
                    label="用户名"
                    :label-width="formLabelWidth"
                    style="font-weight: 400"
                >
                    {{ user.username }}
                </el-form-item>
                <el-form-item
                    label="当前密码"
                    :label-width="formLabelWidth"
                    style="font-weight: 400"
                >
                    <el-input
                        v-model="form.currentPWD"
                        autocomplete="off"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item
                    label="新密码"
                    :label-width="formLabelWidth"
                    style="font-weight: 400"
                >
                    <el-input
                        v-model="form.newPWD"
                        autocomplete="off"
                        show-password
                        placeholder="密码最少为6位"
                    ></el-input>
                </el-form-item>
                <el-form-item
                    label="确认新密码"
                    :label-width="formLabelWidth"
                    style="font-weight: 400"
                >
                    <el-input
                        v-model="form.confirmPWD"
                        autocomplete="off"
                        show-password
                        placeholder="密码最少为6位"
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelChangePWD">取 消</el-button>
                <el-button
                    type="primary"
                    @click="updatePWD"
                    :loading="loadingUpdatePWD"
                    >确 定</el-button
                >
            </div>
        </el-dialog>
    </div>
</template>

<script>
import ImageCropper from "@/components/ImageCropper";
import { sendPWD } from "@/api/user";
import md5 from "js-md5";

export default {
    components: { ImageCropper },
    props: {
        user: {
            type: Object,
            default: () => {
                return {
                    name: "",
                    introduction: "",
                };
            },
        },
    },
    data() {
        return {
            loading: false,
            imagecropperShow: false,
            imagecropperKey: 0,

            changePWDVisible: false,
            formLabelWidth: "120px",
            form: {
                name: "",
                currentPWD: "",
                newPWD: "",
                confirmPWD: "",
            },
            closeOnClickModal: false,
            loadingUpdatePWD: false,
            imgType: "avatar",
            isEdit: false,
        };
    },
    methods: {
        submit() {
            this.loading = true;
            this.$store
                .dispatch("user/changeInfo", {
                    name: this.user.name,
                    introduction: this.user.introduction,
                })
                .then(() => {
                    this.$message({
                        message: "信息更新成功",
                        type: "success",
                        duration: 5 * 1000,
                    });
                    this.loading = false;
                    this.isEdit = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        cropSuccess(resData) {
            this.imagecropperShow = false;
            this.imagecropperKey = this.imagecropperKey + 1;
            /*   console.log(resData); */
            this.image = resData.avatar;
            this.$store
                .dispatch("user/changeAvatar", resData.avatar)
                .then(() => {
                    this.$message({
                        message: "更换头像成功",
                        type: "success",
                    });
                    this.$emit("changeAvatar");
                });
        },
        close() {
            this.imagecropperShow = false;
        },
        cancelChangePWD() {
            this.changePWDVisible = false;
            this.form.currentPWD = "";
            this.form.newPWD = "";
            this.form.confirmPWD = "";
        },
        updatePWD() {
            let cur = this.form.currentPWD;
            let n = this.form.newPWD;
            let con = this.form.confirmPWD;
            if (n != con) {
                this.$message({
                    message: "新密码与确认密码不一致",
                    type: "warning",
                });
                return;
            }
            if (n.length < 6) {
                this.$message({
                    message: "密码长度至少为6位",
                    type: "warning",
                });
                return;
            }
            this.loadingUpdatePWD = true;
            if (n.length)
                sendPWD({
                    cur: md5(cur),
                    n: md5(n),
                })
                    .then(async (res) => {
                        this.$message({
                            message: res.message,
                            type: "success",
                        });
                        this.loadingUpdatePWD = false;
                        await this.$store.dispatch("user/logout");
                        this.$router.push(
                            `/login?redirect=${this.$route.fullPath}`
                        );
                    })
                    .catch((err) => {
                        this.loadingUpdatePWD = false;
                    });
        },
    },
};
</script>

<style lang="scss">
//不显示默认的眼睛
.el-input__inner::-ms-reveal {
    display: none;
}
</style>