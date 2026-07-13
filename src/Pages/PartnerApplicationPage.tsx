import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Image, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ImageIcon, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types/navigation';
import { PartnerApplicationRequest, PartnerProfileResponse } from '../types/partner';
import {
  getMyPartnerApplication,
  createPartnerApplication,
  updatePartnerApplication,
  deletePartnerApplication,
  getBusinessRegistrationPresignedUrl,
} from '../api/partnerApi';
import { getMyRole } from '../api/userApi';

type Phase = 'loading' | 'form' | 'status' | 'error' | 'forbidden';
type Mode = 'create' | 'edit';

const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;

const EMPTY_FORM = {
  companyName: '',
  representativeName: '',
  businessRegistrationNumber: '',
  businessAddress: '',
  contactPhone: '',
  introduction: '',
};

const formatBusinessNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

const STATUS_META: Record<PartnerProfileResponse['approvalStatus'], {
  label: string; color: string; bg: string; Icon: typeof Clock;
}> = {
  PENDING: { label: '심사중', color: '#C97A16', bg: '#FFF1DE', Icon: Clock },
  APPROVED: { label: '승인 완료', color: '#1E8E5A', bg: '#E4F5EC', Icon: CheckCircle2 },
  REJECTED: { label: '반려됨', color: '#D93025', bg: '#FDEAEA', Icon: XCircle },
};

export default function PartnerApplicationPage() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [mode, setMode] = useState<Mode>('create');
  const [application, setApplication] = useState<PartnerProfileResponse | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUploadedUrl, setImageUploadedUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [forbiddenMessage, setForbiddenMessage] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setPhase('loading');
    try {
      const data = await getMyPartnerApplication();
      setApplication(data);
      setPhase('status');
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'PARTNER-001') {
        setApplication(null);
        resetForm();
        setMode('create');
        setPhase('form');
      } else if (code === 'COMMON-004') {
        try {
          const role = await getMyRole();
          if (role === 'PARTNER') {
            setForbiddenMessage('이미 파트너 회원이에요.');
          } else if (role === 'ADMIN') {
            setForbiddenMessage('관리자 계정은 파트너 신청을 이용할 수 없어요.');
          } else {
            setForbiddenMessage('파트너 신청 권한이 없어요.');
          }
        } catch {
          setForbiddenMessage('로그인이 필요한 기능이에요.');
        }
        setPhase('forbidden');
      } else {
        setPhase('error');
      }
    }
  };

  const goBackSafely = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageUri(null);
    setImageUploadedUrl(null);
  };

  const startEdit = () => {
    if (!application) return;
    setForm({
      companyName: application.companyName,
      representativeName: application.representativeName,
      businessRegistrationNumber: application.businessRegistrationNumber,
      businessAddress: application.businessAddress,
      contactPhone: application.contactPhone,
      introduction: application.introduction ?? '',
    });
    setImageUri(application.businessRegistrationImageUrl);
    setImageUploadedUrl(application.businessRegistrationImageUrl);
    setMode('edit');
    setPhase('form');
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageUploadedUrl(null);
    setIsUploadingImage(true);
    try {
      const fileName = asset.fileName ?? `business_${Date.now()}.jpg`;
      const { presignedUrl, fileUrl } = await getBusinessRegistrationPresignedUrl(fileName);
      const blob = await fetch(asset.uri).then(r => r.blob());
      await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType ?? 'image/jpeg' },
      });
      setImageUploadedUrl(fileUrl);
    } catch (e) {
      Alert.alert('오류', '사업자등록증 이미지 업로드에 실패했어요. 다시 시도해주세요.');
      setImageUri(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validate = (): string | null => {
    if (!form.companyName.trim()) return '업체명을 입력해주세요.';
    if (!form.representativeName.trim()) return '대표자명을 입력해주세요.';
    if (!BUSINESS_NUMBER_REGEX.test(form.businessRegistrationNumber)) {
      return '사업자등록번호 형식이 올바르지 않아요. (예: 123-45-67890)';
    }
    if (!form.businessAddress.trim()) return '사업장 주소를 입력해주세요.';
    if (!form.contactPhone.trim()) return '연락처를 입력해주세요.';
    if (!imageUploadedUrl) return '사업자등록증 이미지를 업로드해주세요.';
    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting || isUploadingImage) return;
    const validationError = validate();
    if (validationError) {
      Alert.alert('알림', validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: PartnerApplicationRequest = {
        companyName: form.companyName.trim(),
        representativeName: form.representativeName.trim(),
        businessRegistrationNumber: form.businessRegistrationNumber.trim(),
        businessAddress: form.businessAddress.trim(),
        contactPhone: form.contactPhone.trim(),
        introduction: form.introduction.trim() || undefined,
        businessRegistrationImageUrl: imageUploadedUrl!,
      };

      const result = mode === 'create'
        ? await createPartnerApplication(payload)
        : await updatePartnerApplication(payload);

      setApplication(result);
      setPhase('status');
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message;
      if (code === 'PARTNER-002') {
        Alert.alert('알림', '이미 신청 내역이 존재해요.', [
          { text: '확인', onPress: fetchStatus },
        ]);
      } else if (code === 'COMMON-004') {
        Alert.alert('알림', '로그인이 필요한 기능이에요.');
      } else if (code === 'PARTNER-001') {
        Alert.alert('알림', '신청 이력이 없어요.', [
          { text: '확인', onPress: fetchStatus },
        ]);
      } else {
        Alert.alert('오류', message || '요청 처리 중 문제가 발생했어요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePartnerApplication();
      setApplication(null);
      resetForm();
      setMode('create');
      setShowCancelConfirm(false);
      setPhase('form');
    } catch (err: any) {
      const message = err?.response?.data?.message;
      Alert.alert('오류', message || '취소 처리 중 문제가 발생했어요.');
      setShowCancelConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderNavBar = (title: string, onBack?: () => void) => (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={onBack ?? goBackSafely} style={styles.backBtn} hitSlop={8}>
        <ChevronLeft size={20} color="#423E3E" />
      </TouchableOpacity>
      <Text style={styles.navTitle}>{title}</Text>
    </View>
  );

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar('파트너 신청')}
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#F36845" />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'forbidden') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar('파트너 신청')}
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>{forbiddenMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={goBackSafely}>
            <Text style={styles.retryBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar('파트너 신청')}
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>정보를 불러오지 못했어요</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchStatus}>
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'status' && application) {
    const meta = STATUS_META[application.approvalStatus];
    const StatusIcon = meta.Icon;
    const isApproved = application.approvalStatus === 'APPROVED';
    return (
      <SafeAreaView style={styles.container}>
        {renderNavBar(isApproved ? '파트너 관리' : '파트너 신청 현황')}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!isApproved && (
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <StatusIcon size={16} color={meta.color} />
              <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          )}

          {application.approvalStatus === 'REJECTED' && (
            <>
              <Text style={styles.rejectedNotice}>
                신청이 반려되었어요. 정보를 수정해서 다시 제출해주세요.
              </Text>
              {!!application.rejectionReason && (
                <View style={styles.rejectionReasonBox}>
                  <Text style={styles.rejectionReasonLabel}>반려 사유</Text>
                  <Text style={styles.rejectionReasonText}>{application.rejectionReason}</Text>
                </View>
              )}
            </>
          )}
          {application.approvalStatus === 'PENDING' && (
            <Text style={styles.pendingNotice}>
              담당자가 신청 내용을 검토하고 있어요. 승인되면 파트너 계정으로 전환돼요.
            </Text>
          )}
          <View style={styles.infoCard}>
            <InfoRow label="업체명" value={application.companyName} />
            <InfoRow label="대표자명" value={application.representativeName} />
            <InfoRow label="사업자등록번호" value={application.businessRegistrationNumber} />
            <InfoRow label="사업장 주소" value={application.businessAddress} />
            <InfoRow label="연락처" value={application.contactPhone} />
            {!!application.introduction && (
              <InfoRow label="소개" value={application.introduction} />
            )}
          </View>

          <Text style={styles.imageLabel}>사업자등록증</Text>
          <Image source={{ uri: application.businessRegistrationImageUrl }} style={styles.docPreview} resizeMode="contain" />

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={startEdit}>
              <Text style={styles.actionBtnOutlineText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => setShowCancelConfirm(true)}
            >
              <Text style={styles.actionBtnDangerText}>{isApproved ? '파트너 탈퇴' : '신청 취소'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={showCancelConfirm} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>{isApproved ? '파트너 탈퇴' : '파트너 신청 취소'}</Text>
              <Text style={styles.dialogDesc}>
                {isApproved
                  ? '탈퇴 시 파트너 자격과 업체 정보가 모두 삭제돼요.\n정말 탈퇴하시겠어요?'
                  : '신청 내역이 완전히 삭제돼요.\n정말 취소하시겠어요?'}
              </Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.dialogBtn, styles.dialogBtnOutline]}
                  onPress={() => setShowCancelConfirm(false)}
                >
                  <Text style={styles.dialogBtnOutlineText}>아니오</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogBtn, styles.dialogBtnFill]}
                  onPress={handleCancelApplication}
                  disabled={isDeleting}
                >
                  <Text style={styles.dialogBtnFillText}>{isDeleting ? '처리 중...' : '예'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // phase === 'form'
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderNavBar(
        mode === 'edit'
          ? (application?.approvalStatus === 'APPROVED' ? '파트너 정보 수정' : '파트너 신청 수정')
          : '파트너 신청하기',
        mode === 'edit' ? () => setPhase('status') : undefined,
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={56}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Field
            label="업체명" required
            value={form.companyName}
            onChangeText={(t) => setForm(f => ({ ...f, companyName: t }))}
            placeholder="이삿찜 이사"
          />
          <Field
            label="대표자명" required
            value={form.representativeName}
            onChangeText={(t) => setForm(f => ({ ...f, representativeName: t }))}
            placeholder="홍길동"
          />
          <Field
            label="사업자등록번호" required
            value={form.businessRegistrationNumber}
            onChangeText={(t) => setForm(f => ({ ...f, businessRegistrationNumber: formatBusinessNumber(t) }))}
            placeholder="123-45-67890"
            keyboardType="number-pad"
            maxLength={12}
          />
          <Field
            label="사업장 주소" required
            value={form.businessAddress}
            onChangeText={(t) => setForm(f => ({ ...f, businessAddress: t }))}
            placeholder="서울특별시 강남구 테헤란로 123"
          />
          <Field
            label="연락처" required
            value={form.contactPhone}
            onChangeText={(t) => setForm(f => ({ ...f, contactPhone: t }))}
            placeholder="02-1234-5678"
            keyboardType="phone-pad"
          />
          <Field
            label="소개"
            value={form.introduction}
            onChangeText={(t) => setForm(f => ({ ...f, introduction: t }))}
            placeholder="업체를 간단히 소개해주세요 (선택)"
            multiline
          />

          <Text style={styles.fieldLabel}>
            사업자등록증 <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
            ) : (
              <View style={styles.imagePickerEmpty}>
                <ImageIcon size={28} color="#F36845" />
                <Text style={styles.imagePickerText}>사업자등록증 이미지 업로드</Text>
              </View>
            )}
            {isUploadingImage && (
              <View style={styles.imageUploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, (isSubmitting || isUploadingImage) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? '제출 중...' : mode === 'edit' ? '수정 완료' : '신청하기'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Field({
  label, required, value, onChangeText, placeholder, multiline, keyboardType, maxLength,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad';
  maxLength?: number;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backBtn: { width: 32, justifyContent: 'center' },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 14, fontWeight: '700', color: '#423E3E',
    marginRight: 32,
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorTitle: { fontSize: 14, fontWeight: '600', color: '#423E3E' },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 12, borderWidth: 2, borderColor: '#F36845',
  },
  retryBtnText: { fontSize: 13, fontWeight: '600', color: '#F36845' },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  // Status view
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  pendingNotice: { fontSize: 12, fontWeight: '500', color: '#949494', lineHeight: 18 },
  rejectedNotice: { fontSize: 12, fontWeight: '500', color: '#D93025', lineHeight: 18 },
  rejectionReasonBox: {
    backgroundColor: '#FDEAEA', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, gap: 4,
  },
  rejectionReasonLabel: { fontSize: 11, fontWeight: '600', color: '#D93025' },
  rejectionReasonText: { fontSize: 13, fontWeight: '500', color: '#423E3E', lineHeight: 18 },
  infoCard: {
    backgroundColor: '#FAF5F0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 4,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
    gap: 4,
  },
  infoLabel: { fontSize: 11, fontWeight: '600', color: '#949494' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#423E3E' },
  imageLabel: { fontSize: 12, fontWeight: '600', color: '#423E3E' },
  docPreview: {
    width: '100%', height: 200, borderRadius: 12,
    backgroundColor: '#FAF5F0',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtnOutline: { borderWidth: 2, borderColor: '#F36845' },
  actionBtnOutlineText: { fontSize: 14, fontWeight: '600', color: '#F36845' },
  actionBtnDanger: { borderWidth: 2, borderColor: '#E5E5EA' },
  actionBtnDangerText: { fontSize: 14, fontWeight: '600', color: '#949494' },

  // Form
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#423E3E' },
  required: { color: '#F36845' },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8',
    paddingHorizontal: 14, fontSize: 14, color: '#423E3E',
  },
  inputMultiline: { height: 96, paddingTop: 12, textAlignVertical: 'top' },
  imagePicker: {
    borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8',
    minHeight: 160, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerEmpty: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  imagePickerText: { fontSize: 12, fontWeight: '600', color: '#F36845' },
  imagePreview: { width: '100%', height: 200 },
  imageUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: '#F36845', height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Cancel confirm modal (shared style with SettingsPage dialogs)
  overlay: {
    flex: 1, backgroundColor: 'rgba(31,32,36,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  dialog: {
    width: 300, backgroundColor: '#fff', borderRadius: 16,
    padding: 20, gap: 16, alignItems: 'center',
  },
  dialogTitle: { fontSize: 16, fontWeight: '800', color: '#423E3E', textAlign: 'center' },
  dialogDesc: { fontSize: 12, fontWeight: '500', color: '#949494', textAlign: 'center', lineHeight: 18 },
  dialogActions: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  dialogBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dialogBtnOutline: { borderWidth: 2, borderColor: '#F36845' },
  dialogBtnOutlineText: { fontSize: 13, fontWeight: '600', color: '#F36845' },
  dialogBtnFill: { backgroundColor: '#F36845' },
  dialogBtnFillText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
