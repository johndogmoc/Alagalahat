"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";

import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

type ContactPreference = "phone" | "email" | "in_app_chat";

interface FoundThisPetModalProps {
  reportId: string;
  petName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserEmail: string | null;
  currentUserPhone: string | null;
  onSubmitted?: () => void;
}

interface PreviewImage {
  file: File;
  previewUrl: string;
}

function isAcceptedImage(file: File) {
  return file.type === "image/jpeg" || file.type === "image/png";
}

function validateForm(values: {
  foundLocation: string;
  foundAt: string;
  description: string;
  contactPreference: ContactPreference;
  contactValue: string;
  images: PreviewImage[];
}) {
  const errors: Record<string, string> = {};

  if (!values.foundLocation.trim()) {
    errors.foundLocation = "Location is required.";
  } else if (values.foundLocation.trim().length > 200) {
    errors.foundLocation = "Location must be 200 characters or less.";
  }

  if (!values.foundAt) {
    errors.foundAt = "Date and time found are required.";
  } else {
    const foundAtDate = new Date(values.foundAt);
    if (Number.isNaN(foundAtDate.getTime())) {
      errors.foundAt = "Date and time found are invalid.";
    } else if (foundAtDate.getTime() > Date.now()) {
      errors.foundAt = "Date and time found cannot be in the future.";
    }
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  } else if (values.description.trim().length > 500) {
    errors.description = "Description must be 500 characters or less.";
  }

  if (values.images.length === 0) {
    errors.images = "Please upload at least 1 photo.";
  } else if (values.images.length > 5) {
    errors.images = "You can upload up to 5 images only.";
  }

  if (
    (values.contactPreference === "phone" || values.contactPreference === "email") &&
    !values.contactValue.trim()
  ) {
    errors.contactValue = `A ${values.contactPreference} contact value is required.`;
  }

  return errors;
}

export function FoundThisPetModal({
  reportId,
  petName,
  open,
  onOpenChange,
  currentUserEmail,
  currentUserPhone,
  onSubmitted
}: FoundThisPetModalProps) {
  const [foundLocation, setFoundLocation] = useState("");
  const [foundAt, setFoundAt] = useState("");
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState("");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("phone");
  const [contactValue, setContactValue] = useState(currentUserPhone || "");
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!open) {
      setFoundLocation("");
      setFoundAt("");
      setMapPosition(null);
      setDescription("");
      setContactPreference("phone");
      setContactValue(currentUserPhone || "");
      setSubmitAttempted(false);
      setImages((prev) => {
        prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        return [];
      });
    }
  }, [currentUserPhone, open]);

  useEffect(() => {
    if (contactPreference === "phone") {
      setContactValue(currentUserPhone || "");
    } else if (contactPreference === "email") {
      setContactValue(currentUserEmail || "");
    } else {
      setContactValue("");
    }
  }, [contactPreference, currentUserEmail, currentUserPhone]);

  const errors = useMemo(
    () =>
      validateForm({
        foundLocation,
        foundAt,
        description,
        contactPreference,
        contactValue,
        images
      }),
    [contactPreference, contactValue, description, foundAt, foundLocation, images]
  );

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const nextImages: PreviewImage[] = [];

    for (const file of selectedFiles) {
      if (!isAcceptedImage(file)) {
        toast.error(`${file.name} must be a JPG or PNG image.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5 MB size limit.`);
        continue;
      }

      nextImages.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setImages((prev) => {
      const merged = [...prev, ...nextImages].slice(0, 5);
      if (prev.length + nextImages.length > 5) {
        toast.error("You can upload up to 5 images only.");
      }
      return merged;
    });

    event.currentTarget.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  async function handleSubmit() {
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    const formData = new FormData();
    formData.set("foundLocation", foundLocation.trim());
    formData.set("foundAt", foundAt);
    formData.set("description", description.trim());
    formData.set("contactPreference", contactPreference);
    formData.set("contactValue", contactPreference === "in_app_chat" ? "" : contactValue.trim());
    if (mapPosition) {
      formData.set("latitude", String(mapPosition[0]));
      formData.set("longitude", String(mapPosition[1]));
    }

    images.forEach((image) => {
      formData.append("images", image.file);
    });

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/lost-pets/${reportId}/found-reports`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(payload.error || "Unable to submit your found report.");
        return;
      }

      toast.success(`Your sighting for ${petName} was submitted successfully.`);
      onOpenChange(false);
      onSubmitted?.();
    } catch {
      toast.error("A network error occurred while submitting your report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const shouldShowError = (field: string) => submitAttempted && Boolean(errors[field]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent style={{ maxWidth: 760, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>Found this Pet</DialogTitle>
            <DialogDescription>
              Share where and when you found {petName}. The original poster will be able to review this report.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="foundLocation">Found Location</Label>
              <Input
                id="foundLocation"
                value={foundLocation}
                onChange={(event) => setFoundLocation(event.target.value)}
                placeholder="Exact or approximate place where the pet was found"
                error={shouldShowError("foundLocation") ? errors.foundLocation : ""}
              />
              {shouldShowError("foundLocation") ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-error)" }}>{errors.foundLocation}</p>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="foundAt">Date and Time Found</Label>
              <Input
                id="foundAt"
                type="datetime-local"
                value={foundAt}
                onChange={(event) => setFoundAt(event.target.value)}
                error={shouldShowError("foundAt") ? errors.foundAt : ""}
              />
              {shouldShowError("foundAt") ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-error)" }}>{errors.foundAt}</p>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <Label>Optional Map Pin</Label>
              <div style={{ height: 260, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                <LocationPicker position={mapPosition} onChangePosition={setMapPosition} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                {mapPosition
                  ? `Pinned at ${mapPosition[0].toFixed(5)}, ${mapPosition[1].toFixed(5)}`
                  : "Pinning the map is optional but helpful."}
              </p>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <Label htmlFor="foundImages">Photos</Label>
              <Input
                id="foundImages"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFilesSelected}
              />
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                Upload up to 5 JPG or PNG images, 5 MB each maximum.
              </p>
              {shouldShowError("images") ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-error)" }}>{errors.images}</p>
              ) : null}
              {images.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
                  {images.map((image, index) => (
                    <div
                      key={`${image.file.name}-${index}`}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "var(--color-card)"
                      }}
                    >
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          width: "100%",
                          border: "none",
                          borderTop: "1px solid var(--color-border)",
                          background: "transparent",
                          padding: "8px 10px",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="foundDescription">Short Description</Label>
              <Textarea
                id="foundDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                placeholder="Describe the pet condition, behavior, and anything else that could help."
                error={shouldShowError("description") ? errors.description : ""}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                {shouldShowError("description") ? (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-error)" }}>{errors.description}</p>
                ) : (
                  <span />
                )}
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                  {description.length}/500
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <Label>Contact Preference</Label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { value: "phone" as const, label: "Phone" },
                  { value: "email" as const, label: "Email" },
                  { value: "in_app_chat" as const, label: "In-app chat" }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setContactPreference(option.value)}
                    style={{
                      border: contactPreference === option.value
                        ? "1px solid var(--color-primary)"
                        : "1px solid var(--color-border)",
                      background: contactPreference === option.value
                        ? "rgba(27, 79, 138, 0.08)"
                        : "var(--color-card)",
                      color: "var(--color-text)",
                      borderRadius: 999,
                      padding: "10px 14px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {contactPreference !== "in_app_chat" ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <Input
                    value={contactValue}
                    onChange={(event) => setContactValue(event.target.value)}
                    placeholder={contactPreference === "phone" ? "Phone number" : "Email address"}
                    error={shouldShowError("contactValue") ? errors.contactValue : ""}
                  />
                  {shouldShowError("contactValue") ? (
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-error)" }}>{errors.contactValue}</p>
                  ) : null}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                  In-app chat uses your signed-in account for follow-up.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Found Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
