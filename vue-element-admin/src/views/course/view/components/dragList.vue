<template>
    <draggable
        class="list-group"
        tag="div"
        v-model="sectionList"
        v-bind="dragOptions"
        @start="drag = true"
        @end="
            drag = false;
            onDragEnd();
        "
        :disabled="!dragable"
    >
        <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <div
                class="section"
                :class="{ 'list-group-item': dragable }"
                v-for="element in sectionList"
                :key="element.id"
            >
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>{{ element.name }} </span>
                        <el-button
                            style="float: right; padding: 3px 0"
                            type="text"
                            >操作按钮</el-button
                        >
                    </div>
                    <div class="section-info">
                        {{ element.info }}
                    </div>
                </el-card>
            </div>
        </transition-group>
    </draggable>
</template>

<script>
import draggable from "vuedraggable";

export default {
    name: "DragList",
    components: { draggable },
    props: ["dragable"],
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                disabled: false,
                ghostClass: "ghost",
            };
        },
    },
    data() {
        return {
            drag: true,
            sectionList: [
                { name: "name1", info: "info1", id: "1" },
                { name: "name2", info: "info2", id: "2" },
                { name: "nam32", info: "info3", id: "3" },
            ],
        };
    },
    methods: {
        onDragEnd() {
            alert("?");
        },
    },
};
</script>

<style scoped>
.section-info {
    font-size: 14px;
    margin-bottom: 18px;
    color: #666;
}
.section {
    margin-bottom: 24px;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.flip-list-move {
    transition: transform 0.5s;
}
.no-move {
    transition: transform 0s;
}
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
.list-group {
    min-height: 20px;
}
.list-group-item {
    cursor: move;
}
</style>
