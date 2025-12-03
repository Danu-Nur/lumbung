# Fix id.json by carefully adding missing keys without breaking structure
$content = Get-Content 'messages\id.json' -Raw
$json = $content | ConvertFrom-Json

# Add common.actions
$commonActions = [PSCustomObject]@{
    view = "Lihat"
    edit = "Ubah"
    delete = "Hapus"
    cancel = "Batal"
    save = "Simpan"
    saving = "Menyimpan..."
    deleting = "Menghapus..."
    close = "Tutup"
    deleteConfirmTitle = "Konfirmasi Hapus"
    deleteConfirmDescription = "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
    createSuccess = "Berhasil dibuat"
    createError = "Gagal membuat"
    updateSuccess = "Berhasil diperbarui"
    updateError = "Gagal memperbarui"
    deleteSuccess = "Berhasil dihapus"
    deleteError = "Gagal menghapus"
}

$json.common | Add-Member -MemberType NoteProperty -Name 'actions' -Value $commonActions -Force

# Add common.help.buttonLabel
$json.common.help | Add-Member -MemberType NoteProperty -Name 'buttonLabel' -Value "Panduan" -Force

# Add Common.actions (capital C) for compatibility
$json | Add-Member -MemberType NoteProperty -Name 'Common' -Value ([PSCustomObject]@{
    actions = $commonActions
}) -Force

# Save with proper formatting (depth 10 to preserve nested structure)
$json | ConvertTo-Json -Depth 10 | Set-Content 'messages\id.json.tmp'

# Now manually fix the structure by reading original and tmp
$original = Get-Content 'messages\id.json' -Raw
$updated = Get-Content 'messages\id.json.tmp' -Raw

# Use the updated version
$updated | Set-Content 'messages\id.json'
Remove-Item 'messages\id.json.tmp'

Write-Host "Fixed id.json with common.actions"
