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
                                <span class="section-name">
                                    {{ element.name }}
                                    <svg-icon v-if="!element.visible" icon-class="invisible" />
                                </span>

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
                        <div class="section-info">{{ element.info }}</div>
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
                <el-button type="primary">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import draggable from "vuedraggable"

export default {
    name: "SectionList",
    components: { draggable },
    props: ["sections", "editable"],
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                ghostClass: "ghost",
            }
        },
    },
    data() {
        return {
            drag: true,
            sectionList: this.sections,
            setUpDialogVisible: false,
            sectionInfomation: {
                visible: false,
            },
        }
    },
    methods: {
        onDragEnd() {},
        showSetUpDialog(section) {
            this.setUpDialogVisible = true
            this.sectionInfomation = {
                visible: section.visible,
            }
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
