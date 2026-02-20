# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Google Mobile Ads
-keep public class com.google.android.gms.ads.** {
   public *;
}

# Keep Firebase and GMS
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# For react-native-google-mobile-ads
-keep class io.invertase.googlemobileads.** { *; }

# Handle reflection for Native Ads
-keepclassmembers class * {
  @com.google.android.gms.ads.mediation.customevent.CustomEvent* <fields>;
  @com.google.android.gms.ads.mediation.customevent.CustomEvent* <methods>;
}
