from django.contrib import admin
from .models import ConversationSession, ConversationMessages

class ConversationMessagesInline(admin.TabularInline):
    model = ConversationMessages
    extra = 0
    readonly_fields = ('role', 'content', 'timestamp')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(ConversationSession)
class ConversationSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'created_at', 'updated_at', 'is_completed')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('session_id', 'user__username')
    readonly_fields = ('session_id', 'created_at', 'updated_at')
    inlines = [ConversationMessagesInline]