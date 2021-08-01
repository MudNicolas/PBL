<template>
    <div>
        <draggable
            class="list-group"
            tag="div"
            v-model="sectionList"
            v-bind="dragOptions"
            @start="drag = true"
            handle=".move-handle"
            @end="
                drag = false
                onDragEnd()
            "
        >
            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                <div class="section" v-for="element in sectionList" :key="element._id">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <div class="header">
                                <router-link :to="'/course/section/view/' + element._id">
                                    <span class="section-name">
                                        <div>
                                            {{ element.name }}
                                        </div>
                                        <div title="学生不可见">
                                            <svg-icon
                                                v-if="!element.visible"
                                                icon-class="invisible"
                                            />
                                        </div>
                                    </span>
                                </router-link>

                                <div class="right-panel" v-show="editable">
                                    <i class="el-icon-rank move-handle" />
                                    <el-button
                                        style="padding: 3px 0; margin-right: 12px"
                                        type="text"
                                        @click="showSetUpDialog(element)"
                                    >
                                        设置
                                    </el-button>
                                </div>
                            </div>
                        </div>
                        <div class="section-info">{{ element.info | noInfo }}</div>
                    </el-card>
                </div>
            </transition-group>
        </draggable>

        <el-dialog title="设置" :visible.sync="setUpDialogVisible" width="30%">
            <el-form :model="sectionInfomation" label-width="56px">
                <el-form-item label="可见性">
                    <el-switch v-model="sectionInfomation.visible"></el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setUpDialogVisible = false">取 消</el-button>
                <el-button @click="setVisible" :loading="visibleSetting" type="primary">
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import draggable from "vuedraggable"
import { sectionSort, sectionSet } from "@/api/section"

export default {
    name: "SectionList",
    components: { draggable },
    props: ["sections", "editable", "courseId"],
    filters: {
        noInfo: function (val) {
            if (!val) {
                return "暂无简介"
            }
            return val
        },
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                ghostClass: "ghost",
            }
        },
    },
    watch: {
        sections(nv) {
            this.sectionList = nv
        },
    },
    data() {
        return {
            drag: true,
            sectionList: this.sections,
            setUpDialogVisible: false,
            sectionInfomation: {
                _id: "",
                visible: false,
            },
            visibleSetting: false,
        }
    },
    methods: {
        onDragEnd() {
            let $message = this.$message({
                message: "  正在处理",
                customClass: "theme-message",
                type: "success",
                duration: 0,
                iconClass: "el-icon-loading",
            })
            let sectionIDs = this.sectionList.map(e => e._id)
            sectionSort({ courseID: this.courseId, sectionIDs: sectionIDs })
                .then(() => {
                    $message.close()
                })
                .catch(() => {
                    $message.close()
                })
        },
        showSetUpDialog(section) {
            this.setUpDialogVisible = true
            this.sectionInfomation = {
                visible: section.visible,
                _id: section._id,
            }
        },
        setVisible() {
            this.visibleSetting = true
            let section = this.sectionInfomation
            sectionSet({
                section: section,
            })
                .then(() => {
                    this.visibleSetting = false
                    this.setUpDialogVisible = false
                    this.$message.success("设置成功")
                    this.$emit("updateVisible", section)
                })
                .catch(() => {
                    this.visibleSetting = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.section {
    margin-bottom: 24px;

    .section-name {
        font-size: 18px;
        line-height: 22px;
        display: flex;

        div {
            margin-right: 8px;
        }
    }
    .section-info {
        font-size: 14px;
        margin-bottom: 18px;
        color: #666;
    }
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.header {
    display: flex;
    align-items: center;

    .right-panel {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
}

.move-handle {
    font-size: 20px;
    cursor: move;
    margin-right: 16px;
}

.el-dropdown-link {
    cursor: pointer;
}
</style>
