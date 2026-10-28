"use client";

import { useActionState, useState } from "react";
import { saveProfile } from "@/app/actions/profiles";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BirthProfile } from "@/lib/db/schema";
import { LinkButton } from "./link-button";
import { PlacePicker, type PickedPlace } from "./place-picker";

export function ProfileForm({ profile, cancelHref }: { profile?: BirthProfile; cancelHref?: string }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  const [name, setName] = useState(profile?.name ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "");
  const [timeUnknown, setTimeUnknown] = useState(profile ? profile.birthTime === null : false);
  const [gender, setGender] = useState<string>(profile?.gender ?? "");
  const [place, setPlace] = useState<PickedPlace | null>(
    profile
      ? { name: profile.placeName, latitude: profile.latitude, longitude: profile.longitude, timezone: profile.timezone }
      : null,
  );
  const err = state.fieldErrors ?? {};
  const invalid = (k: string) => (err[k] ? true : undefined);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      {profile && <input type="hidden" name="id" value={profile.id} />}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={invalid("name")}>
          <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
          <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={invalid("name")} />
          <FieldDescription>Tên đầy đủ, có dấu. Thần số học dùng tên này.</FieldDescription>
          <FieldError>{err.name}</FieldError>
        </Field>

        <Field data-invalid={invalid("birthDate")}>
          <FieldLabel htmlFor="birthDate">Ngày sinh (dương lịch)</FieldLabel>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            min="1900-01-01"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            aria-invalid={invalid("birthDate")}
          />
          <FieldError>{err.birthDate}</FieldError>
        </Field>

        <Field data-invalid={invalid("birthTime")} data-disabled={timeUnknown || undefined}>
          <FieldLabel htmlFor="birthTime">Giờ sinh</FieldLabel>
          <Input
            id="birthTime"
            name="birthTime"
            type="time"
            value={timeUnknown ? "" : birthTime}
            disabled={timeUnknown}
            onChange={(e) => setBirthTime(e.target.value)}
            aria-invalid={invalid("birthTime")}
          />
          <FieldDescription>Giờ đồng hồ tại nơi sinh, như trên giấy khai sinh.</FieldDescription>
          <FieldError>{err.birthTime}</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="timeUnknown"
            name="timeUnknown"
            checked={timeUnknown}
            onCheckedChange={(v) => setTimeUnknown(v === true)}
          />
          <FieldLabel htmlFor="timeUnknown" className="font-normal">
            Không rõ giờ sinh (không lập được tử vi, chiêm tinh thiếu cung Mọc)
          </FieldLabel>
        </Field>

        <Field data-invalid={invalid("gender")}>
          <FieldLabel>Giới tính</FieldLabel>
          <input type="hidden" name="gender" value={gender} />
          <ToggleGroup
            variant="outline"
            value={gender ? [gender] : []}
            onValueChange={(v) => setGender(v[0] ?? "")}
            aria-invalid={invalid("gender")}
          >
            <ToggleGroupItem value="male">Nam</ToggleGroupItem>
            <ToggleGroupItem value="female">Nữ</ToggleGroupItem>
          </ToggleGroup>
          <FieldError>{err.gender}</FieldError>
        </Field>

        <Field data-invalid={invalid("placeName")}>
          <FieldLabel>Nơi sinh</FieldLabel>
          <PlacePicker value={place} onChange={setPlace} invalid={invalid("placeName")} />
          {place && (
            <>
              <input type="hidden" name="placeName" value={place.name} />
              <input type="hidden" name="latitude" value={place.latitude} />
              <input type="hidden" name="longitude" value={place.longitude} />
              <input type="hidden" name="timezone" value={place.timezone} />
            </>
          )}
          <FieldDescription>Chọn từ danh sách gợi ý để app lấy tọa độ và múi giờ.</FieldDescription>
          <FieldError>{err.placeName}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Lưu hồ sơ
        </Button>
        {cancelHref && (
          <LinkButton href={cancelHref} variant="ghost">
            Hủy
          </LinkButton>
        )}
      </div>
    </form>
  );
}
