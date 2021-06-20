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
                        listType="学号"
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
                        <el-table-column
                            v-for="item of tableHeader"
                            :key="item"
                            :prop="item"
                            :label="item"
                        />
                    </el-table>
                </el-form-item>
            </el-col>
        </el-row>
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
                        >下一步</el-button
                    >
                </el-form-item>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import UploadExcelComponent from "@/components/UploadExcel/index.vue";

export default {
    name: "uploadStudent",
    components: { UploadExcelComponent },
    props: ["course"],
    data() {
        return {
            tableHeader: ["学号", "姓名"],
            infoText: "导入学生，将Excel文件拖到此处，或",
            amount: 0,
        };
    },
    methods: {
        beforeUpload(file) {
            const isLt1M = file.size / 1024 / 1024 < 1;

            if (isLt1M) {
                return true;
            }

            this.$message({
                message: "Please do not upload files larger than 1m in size.",
                type: "warning",
            });
            return false;
        },
        handleSuccess({ results }) {
            //console.log(results);
            //判断重复
            let studentNum = [];
            results.forEach((e) => {
                //数组中已有这个学号
                if (studentNum.indexOf(e["学号"]) != -1) {
                    this.$message({
                        type: "warning",
                        message: "学生学号存在重复，请检查学生数据",
                    });
                    this.course.studentList = [];
                    return;
                } else {
                    studentNum.push(e["学号"]);
                }
            });

            this.amount = results.length;
            if (this.amount == studentNum.length) {
                //console.log(studentNum);
                this.course.studentList = results;
            }
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

<style>
</style>