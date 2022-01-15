<template>
    <div>
        <div>
            <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-upload2"
                @click="dialogVisible = true"
            >
                导入{{ roleLabel[role] }}
            </el-button>
            <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-document"
                :loading="exporting"
                @click="handleExport"
            >
                导出Excel
            </el-button>
        </div>

        <el-table
            style="width: 100%; margin-top: 20px"
            v-loading="loading"
            :data="users"
            border
            highlight-current-row
        >
            <el-table-column prop="username" :label="usernameLabel[role]"></el-table-column>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column label="头像">
                <template slot-scope="scope">
                    <el-popover
                        placement="left"
                        trigger="hover"
                        :open-delay="popoverOpenDelay"
                        width="360"
                        @show="showUpPopoverKey = scope.row._id"
                    >
                        <div>
                            <profile-popover
                                :uid="scope.row._id"
                                :show-up-popover-key="showUpPopoverKey"
                            />
                        </div>
                        <span slot="reference">
                            <el-avatar :src="avatarPath + scope.row.avatar"></el-avatar>
                        </span>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button type="primary">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :title="`导入${roleLabel[role]}`" :visible.sync="dialogVisible">
            <el-form>
                <el-row>
                    <el-col>
                        <el-form-item style="margin-bottom: 0px">
                            <upload-excel-component
                                :on-success="handleSuccess"
                                :before-upload="beforeUpload"
                                :infoText="infoText"
                                :tHeader="[usernameLabel[role], '姓名']"
                                :filterVal="['id', 'name']"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col>
                        <el-form-item>
                            <el-table
                                :data="uploadUserList"
                                border
                                highlight-current-row
                                style="width: 100%; margin-top: 20px"
                            >
                                <el-table-column
                                    prop="username"
                                    :label="usernameLabel[role]"
                                    sortable
                                />
                                <el-table-column prop="name" label="姓名" />
                            </el-table>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div style="display: flex">
                    <el-button style="margin-left: auto" @click="cancel">取消</el-button>
                    <el-button
                        type="primary"
                        :disabled="uploadUserList.length === 0"
                        @click="handleSubmit"
                        :loading="submitting"
                    >
                        导入
                    </el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { getUser, submitUser } from "@/api/admin"
import UploadExcelComponent from "@/components/UploadExcel/index.vue"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import EmitMessageButton from "@/components/EmitMessageButton"

export default {
    props: ["role"],
    components: { UploadExcelComponent, ProfilePopover, EmitMessageButton },

    data() {
        return {
            loading: true,
            users: [],
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            usernameLabel: {
                teacher: "工号",
                student: "学号",
            },
            uploadUserList: [],
            roleLabel: {
                teacher: "教师",
                student: "学生",
            },
            infoText: `导入用户，将Excel文件拖到此处，或`,
            exporting: false,
            showUpPopoverKey: "",
            popoverOpenDelay: 200,
            submitting: false,
            dialogVisible: false,
        }
    },
    created() {
        this.getUser()
    },
    methods: {
        handleSubmit() {
            this.submitting = true
            let { uploadUserList, role } = this
            submitUser({
                userList: uploadUserList,
                role,
            })
                .then(() => {
                    this.$message({
                        type: "success",
                        message: "导入成功",
                    })
                    this.dialogVisible = false
                    this.getUser()
                    this.uploadUserList = []
                    this.submitting = false
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        getUser() {
            this.loading = true
            let { role } = this
            getUser({ role })
                .then(res => {
                    this.users = res.data.users
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handleExport() {
            this.exporting = true
            import("@/vendor/Export2Excel")
                .then(excel => {
                    let { role, usernameLabel, roleLabel } = this
                    const tHeader = [usernameLabel[role], "姓名"]
                    const filterVal = ["username", "name"]
                    const list = this.users
                    const data = this.formatJson(filterVal, list)
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: `${roleLabel[role]}数据`,
                        autoWidth: true,
                        bookType: "xlsx",
                    })

                    this.exporting = false
                })
                .catch(e => {
                    this.$message({
                        type: "warning",
                        message: e,
                    })
                    this.exporting = false
                })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === "timestamp") {
                        return parseTime(v[j])
                    } else {
                        return v[j]
                    }
                })
            )
        },
        cancel() {
            this.dialogVisible = false
        },
        handleSuccess({ results }) {
            let { role, usernameLabel, roleLabel } = this

            //console.log(results);
            //判断文件是否符合规范
            if (!results[0] || !results[0][usernameLabel[role]] || !results[0]["姓名"]) {
                this.$message({
                    type: "warning",
                    message: "文件错误，请遵循模板格式填入信息！",
                })
                return
            }
            //判断重复
            let userNum = []
            results.forEach(e => {
                //数组中已有这个学号
                e[usernameLabel[role]] = (e[usernameLabel[role]] || "").toString().trim()
                e["姓名"] = (e["姓名"] || "").toString().trim()
                if (e[usernameLabel[role]] === "" || e["姓名"] === "") {
                    this.$message({
                        type: "warning",
                        message: `文件中存在${usernameLabel[role]}号或姓名为空！`,
                    })
                    this.uploadUserList = []
                    return
                }
                if (userNum.indexOf(e[usernameLabel[role]]) !== -1) {
                    this.$message({
                        type: "warning",
                        message: `文件中${usernameLabel[role]}存在重复，请检查${roleLabel[role]}数据`,
                    })
                    this.uploadUserList = []
                    return
                }
                userNum.push(e[usernameLabel[role]])
            })

            this.amount = results.length
            if (this.amount == userNum.length) {
                //console.log(userNum);
                this.uploadUserList = results.map(e => ({
                    username: e[usernameLabel[role]],
                    name: e["姓名"],
                }))
            }
        },
        beforeUpload(file) {
            const isLt1M = file.size / 1024 / 1024 < 1

            if (isLt1M) {
                return true
            }

            this.$message({
                message: "文件大小限制1MB",
                type: "warning",
            })
            return false
        },
    },
}
</script>

<style lang="scss" scoped>
</style>
