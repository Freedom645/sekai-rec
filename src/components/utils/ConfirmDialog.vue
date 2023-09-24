<template>
  <v-dialog v-model="isOpen" width="400">
    <template v-slot:default>
      <v-card :title="dialogText.title">
        <v-card-text>
          {{ dialogText.text }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn v-if="dialogText.ok" color="success" :text="dialogText.ok" @click="ok()"></v-btn>
          <v-btn v-if="dialogText.cancel" :text="dialogText.cancel" @click="cancel()"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import { VDialog, VCard, VCardText, VCardActions } from 'vuetify/lib/components/index.mjs';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const { isOpen, ok, cancel, close, dialogText } = useConfirmDialog();
</script>
