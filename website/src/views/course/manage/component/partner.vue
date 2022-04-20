<template>
    <div class="container" v-loading="loading">
        <div v-if="uid === chiefTeacher._id" style="margin-bottom: 24px">
            <el-button type="primary" icon="el-icon-user-solid" @click="dialogVisible = true">
                添加协作教师
            </el-button>
        </div>
        <el-row style="margin-bottom: 24px">
            <el-col :span="6" :xs="24">
                <div class="title">主教师</div>
                <teacher-card :t="chiefTeacher" :uid="uid" />
            </el-col>
        </el-row>
        <el-row v-if="partnerTeacher.length > 0">
            <div class="title">协作教师</div>
            <el-row
                v-for="index in Math.ceil(partnerTeacher.length / 4)"
                :key="'managePartnerTeacher-row-' + index"
                style="margin-bottom: 24px"
                :gutter="20"
            >
                <el-col
                    :span="6"
                    v-for="t in partnerTeacher.slice((index - 1) * 4, index * 4)"
                    :key="'managePartnerTeacher-col' + t._id"
                >
                    <teacher-card :t="t" :uid="uid" />
                </el-col>
            </el-row>
        </el-row>
        <el-dialog title="添加协作教师" :visible.sync="dialogVisible">
            <el-form>
                <el-row>
                    <el-col :span="16" :offset="4">
                        <el-form-item label="协作教师">
                            <el-select
                                v-model="newPartner"
                                multiple
                                filterable
                                remote
                                :popper-append-to-body="popperAppendToBody"
                                placeholder="请输入姓名进行搜索"
                                :remote-method="fetchTeacher"
                                :loading="searchLoading"
                            >
                                <el-option
                                    v-for="item in searchOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <div style="display: flex">
                                <el-button style="margin-left: auto" @click="cancel"
                                    >取消</el-button
                                >
                                <el-button
                                    type="primary"
                                    :disabled="newPartner.length === 0"
                                    @click="handleSubmit"
                                    :loading="submitting"
                                    >确认添加</el-button
                                >
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { getAllTeacher, manageSearchTeacher, addPartnerTeacher } from "@/api/course"
import TeacherCard from "./component/teacherCard.vue"
import { mapGetters } from "vuex"
export default {
    name: "Partner",
    props: ["courseId"],
    components: { TeacherCard },
    data() {
        return {
            loading: true,
            chiefTeacher: {},
            partnerTeacher: [],
            dialogVisible: false,
            searchLoading: false,
            searchOptions: [],
            newPartner: [],
            submitting: false,

            popperAppendToBody: true,
        }
    },
    computed: {
        ...mapGetters(["uid"]),
    },
    created() {
        this.getAllTeacher()
    },
    methods: {
        getAllTeacher() {
            this.loading = true
            getAllTeacher({ courseID: this.courseId })
                .then((res) => {
                    let { chiefTeacher } = res.data.teahcer
                    let { partnerTeacher } = res.data.teahcer
                    this.chiefTeacher = chiefTeacher

                    this.partnerTeacher = partnerTeacher
                    this.loading = false
                })
                .catch(() => {})
        },
        fetchTeacher(query) {
            if (query !== "") {
                this.searchLoading = true
                manageSearchTeacher({ name: query, courseID: this.courseId })
                    .then((res) => {
                        const { data } = res
                        this.searchOptions = data.map((item) => {
                            return {
                                value: item._id,
                                label: item.username + " " + item.name,
                            }
                        })

                        this.searchLoading = false
                    })
                    .catch(() => {
                        this.searchLoading = false
                    })
            } else {
                this.searchOptions = []
                this.$emit("update:options", [])
            }
        },
        cancel() {
            this.dialogVisible = false
        },
        handleSubmit() {
            this.submitting = true
            addPartnerTeacher({
                courseID: this.courseId,
                t_uids: this.newPartner,
            })
                .then(() => {
                    this.$message({
                        type: "success",
                        message: "添加协作教师成功",
                    })
                    this.submitting = false
                    this.dialogVisible = false
                    this.searchOptions = []
                    this.newPartner = []
                    this.getAllTeacher()
                })
                .catch(() => {
                    this.submitting = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.title {
    margin-bottom: 16px;

    font-size: 16px;
    color: #1f2f3d;
}
.container {
    padding-top: 15px;
    min-height: 120px;
}
</style>
