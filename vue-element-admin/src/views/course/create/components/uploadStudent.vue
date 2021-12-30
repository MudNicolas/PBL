<template>
    <div>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <div class="info">学生数据可后续添加</div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item style="margin-bottom: 0px">
                    <upload-excel-component
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                        :infoText="infoText"
                        :tHeader="['学号', '姓名']"
                        :filterVal="['id', 'name']"
                    />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="16" :offset="4">
                <el-form-item>
                    <el-table
                        :data="course.studentList"
                        border
                        highlight-current-row
                        style="width: 100%; margin-top: 20px"
                    >
                        <el-table-column prop="学号" label="学号" sortable />
                        <el-table-column prop="姓名" label="姓名" />
                    </el-table>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="16" :offset="4" style="margin-top: 16px">
                <el-form-item>
                    <el-button style="margin-top: 12px" @click="prev">上一步</el-button>

                    <el-button style="margin-top: 12px" @click="next" type="primary">
                        下一步
                    </el-button>
                </el-form-item>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import UploadExcelComponent from "@/components/UploadExcel/index.vue"

export default {
    name: "uploadStudent",
    components: { UploadExcelComponent },
    props: ["course"],
    data() {
        return {
            infoText: "导入学生，将Excel文件拖到此处，或",
            amount: 0,
        }
    },
    methods: {
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
        handleSuccess({ results }) {
            //console.log(results);
            //判断文件是否符合规范
            if (!results[0] || !results[0]["学号"] || !results[0]["姓名"]) {
                this.$message({
                    type: "warning",
                    message: "文件错误，请遵循模板格式填入信息！",
                })
                return
            }
            //判断重复
            let studentNum = []
            results.forEach(e => {
                //数组中已有这个学号
                e["学号"] = (e["学号"] || "").toString().trim()
                e["姓名"] = (e["姓名"] || "").toString().trim()
                if (e["学号"] === "" || e["姓名"] === "") {
                    this.$message({
                        type: "warning",
                        message: "文件中存在学生学号或姓名为空！",
                    })
                    this.course.studentList = []
                    return
                }
                if (studentNum.indexOf(e["学号"]) !== -1) {
                    this.$message({
                        type: "warning",
                        message: "学生学号存在重复，请检查学生数据",
                    })
                    this.course.studentList = []
                    return
                }
                studentNum.push(e["学号"])
            })

            this.amount = results.length
            if (this.amount == studentNum.length) {
                //console.log(studentNum);
                this.course.studentList = results
            }
        },
        next() {
            this.$emit("next")
        },
        prev() {
            this.$emit("prev")
        },
    },
}
</script>

<style>
</style>
