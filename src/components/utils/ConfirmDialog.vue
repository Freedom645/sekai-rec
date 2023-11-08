<template>
  <v-dialog v-model="isOpen" width="400">
    <template v-slot:default>
      <v-card :title="dialogText.title">
        <v-card-text>
          <span v-html="dialogText.text"></span>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn v-if="dialogText.ok" variant="flat" color="success" @click="() => ok()">{{ dialogText.ok }}</v-btn>
          <v-btn v-if="dialogText.cancel" variant="flat" @click="() => cancel()">
            {{ dialogText.cancel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import { VDialog, VCard, VCardText, VCardActions, VBtn } from 'vuetify/lib/components/index.mjs';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const { isOpen, ok, cancel, dialogText } = useConfirmDialog();
</script>
